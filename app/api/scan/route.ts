// /app/api/scan/route.ts

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import net from 'net';

interface ScanResult {
  sslValid: boolean;
  xssVulnerable: boolean;
  sqlInjectionVulnerable: boolean;
  missingHeaders: string[];
  openPorts: { port: number; status: string }[];
}

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  const scanResult: ScanResult = {
    sslValid: false,
    xssVulnerable: false,
    sqlInjectionVulnerable: false,
    missingHeaders: [],
    openPorts: [],
  };

  // SSL/TLS Certificate Validation
  try {
    const response = await axios.get(url);
    const certificate = response.request.socket.getPeerCertificate();
    const expiryDate = new Date(certificate.valid_to);
    scanResult.sslValid = expiryDate > new Date();
  } catch (error) {
    console.error('SSL check failed:', error);
  }

  // Cross-Site Scripting (XSS) Detection
  const xssPayload = "<script>alert('XSS')</script>";
  try {
    const response = await axios.get(`${url}?test=${encodeURIComponent(xssPayload)}`);
    scanResult.xssVulnerable = response.data.includes(xssPayload);
  } catch (error) {
    console.error('XSS check failed:', error);
  }

  // SQL Injection Detection
  const sqlPayload = "' OR '1'='1";
  try {
    const response = await axios.get(`${url}?test=${encodeURIComponent(sqlPayload)}`);
    scanResult.sqlInjectionVulnerable = response.data.includes('SQL error') || response.data.includes('database');
  } catch (error) {
    console.error('SQL Injection check failed:', error);
  }

  // Security Headers Inspection
  try {
    const response = await axios.get(url);
    if (!response.headers['content-security-policy']) {
      scanResult.missingHeaders.push('Missing Content-Security-Policy');
    }
    if (!response.headers['strict-transport-security']) {
      scanResult.missingHeaders.push('Missing Strict-Transport-Security');
    }
  } catch (error) {
    console.error('Security headers check failed:', error);
  }

  // Open Port Detection (e.g., for common ports 80, 443)
  const portsToCheck = [80, 443];
  for (const port of portsToCheck) {
    try {
      const portStatus = await scanPort(url, port);
      scanResult.openPorts.push({ port, status: portStatus });
    } catch (error) {
      console.error(`Port ${port} check failed:`, error);
    }
  }

  return NextResponse.json(scanResult);
}

async function scanPort(url: string, port: number): Promise<string> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(2000);

    socket.on('connect', () => {
      resolve('open');
      socket.destroy();
    });

    socket.on('timeout', () => {
      resolve('closed');
      socket.destroy();
    });

    socket.on('error', () => {
      resolve('closed');
    });

    socket.connect(port, url);
  });
}
