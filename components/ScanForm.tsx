// /app/components/ScanForm.tsx

'use client';

import { useState } from 'react';
import axios from 'axios';
// import { generatePDFReport } from '../utils/reportGenerator';
import { generatePDFReport } from '@/app/utils/reportGenetor';

interface ScanResult {
  sslValid: boolean;
  xssVulnerable: boolean;
  sqlInjectionVulnerable: boolean;
  missingHeaders: string[];
  openPorts: { port: number; status: string }[];
}

export default function ScanForm() {
  const [url, setUrl] = useState<string>('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Updated URL Validation using URL constructor
  const isValidUrl = (inputUrl: string) => {
    try {
      new URL(inputUrl);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setScanResult(null);

    // Validate URL
    if (!isValidUrl(url)) {
      setError('Please enter a valid URL.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/scan', { url });
      setScanResult(response.data);
    } catch (err: any) {
      setError('Failed to scan the URL.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (scanResult) {
      generatePDFReport(scanResult, url);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Enter website URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Scanning...' : 'Scan Website'}
        </button>
      </form>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {scanResult && (
        <div className="mt-4 bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-bold">Scan Results for {url}</h2>
          <p><strong>SSL Valid:</strong> {scanResult.sslValid ? 'Yes' : 'No'}</p>
          <p><strong>XSS Vulnerable:</strong> {scanResult.xssVulnerable ? 'Yes' : 'No'}</p>
          <p><strong>SQL Injection Vulnerable:</strong> {scanResult.sqlInjectionVulnerable ? 'Yes' : 'No'}</p>
          <h3 className="font-semibold mt-2">Missing Security Headers:</h3>
          {scanResult.missingHeaders.length > 0 ? (
            <ul className="list-disc pl-5">
              {scanResult.missingHeaders.map((header, index) => (
                <li key={index} className="text-red-600">{header}</li>
              ))}
            </ul>
          ) : (
            <p>No missing headers.</p>
          )}
          <h3 className="font-semibold mt-2">Open Ports:</h3>
          <ul className="list-disc pl-5">
            {scanResult.openPorts.map((port, index) => (
              <li key={index}>{port.port}: {port.status}</li>
            ))}
          </ul>

          <button
            onClick={handleDownloadReport}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
          >
            Download Report
          </button>
        </div>
      )}
    </div>
  );
}
