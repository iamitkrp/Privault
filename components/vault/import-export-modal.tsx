'use client';

import { useState, useRef } from 'react';
import { useFocusTrap, useKeyboardNavigation, announceToScreenReader } from '@/hooks/use-keyboard-navigation';
import { importExportService, type ExportOptions, type ImportResult } from '@/services/import-export.service';
import { useAuth } from '@/lib/auth/auth-context';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (result: ImportResult) => void;
  mode: 'import' | 'export';
}

export default function ImportExportModal({
  isOpen,
  onClose,
  onImportComplete,
  mode
}: ImportExportModalProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Focus trap for modal
  useFocusTrap(isOpen, modalRef as React.RefObject<HTMLElement>);
  
  // Keyboard navigation
  useKeyboardNavigation({
    onEscape: onClose,
    enabled: isOpen
  });
  
  // Export state
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includePasswords: true,
    encrypted: false
  });
  const [isExporting, setIsExporting] = useState(false);
  
  // Import state
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importFormat, setImportFormat] = useState<'json' | 'csv' | 'auto'>('auto');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    if (!user) return;
    
    setIsExporting(true);
    announceToScreenReader('Starting export...', 'polite');
    
    try {
      const result = await importExportService.exportVault(user.id, exportOptions);
      
      if (result.success && result.data) {
        // Create and download file
        const filename = importExportService.createBackupFilename(exportOptions.format, exportOptions.encrypted);
        const blob = new Blob([result.data], { 
          type: exportOptions.format === 'json' ? 'application/json' : 'text/csv' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        announceToScreenReader('Vault exported successfully', 'polite');
        onClose();
      } else {
        announceToScreenReader(`Export failed: ${result.error}`, 'assertive');
        alert(`Export failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      announceToScreenReader('Export failed. Please try again.', 'assertive');
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setImportFile(file || null);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (!user || !importFile) return;
    
    setIsImporting(true);
    announceToScreenReader('Starting import...', 'polite');
    
    try {
      const fileContent = await importFile.text();
      const result = await importExportService.importVault(user.id, fileContent, importFormat);
      
      setImportResult(result);
      
      const message = result.success 
        ? `Import completed. ${result.imported} passwords imported, ${result.skipped} skipped, ${result.duplicates} duplicates found.`
        : `Import failed. ${result.errors.join(', ')}`;
      
      announceToScreenReader(message, result.success ? 'polite' : 'assertive');
      
      if (onImportComplete) {
        onImportComplete(result);
      }
    } catch (error) {
      console.error('Import error:', error);
      const errorResult = {
        success: false,
        imported: 0,
        skipped: 0,
        errors: ['Failed to read file or parse data'],
        duplicates: 0
      };
      setImportResult(errorResult);
      announceToScreenReader('Import failed. Please check your file and try again.', 'assertive');
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setImportFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md"
        role="document"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 
              id="modal-title"
              className="text-xl font-semibold text-gray-900 dark:text-gray-100"
            >
              {mode === 'export' ? 'Export Vault' : 'Import Passwords'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {mode === 'export' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Export Format
                </label>
                <select
                  value={exportOptions.format}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as 'json' | 'csv' }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  <option value="json">JSON (Recommended)</option>
                  <option value="csv">CSV (Spreadsheet)</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includePasswords}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includePasswords: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Include passwords</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.encrypted}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, encrypted: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Encrypt export (requires vault password)</span>
                </label>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Security Notice:</strong> Exported data contains sensitive information. 
                  Store the file securely and delete it when no longer needed.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? 'Exporting...' : 'Export'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {!importResult ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Import Format
                    </label>
                    <select
                      value={importFormat}
                      onChange={(e) => setImportFormat(e.target.value as 'json' | 'csv' | 'auto')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      <option value="auto">Auto-detect</option>
                      <option value="json">JSON</option>
                      <option value="csv">CSV</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select File
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,.csv,.txt"
                      onChange={handleFileSelect}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Supported formats:</strong> Privault JSON exports, CSV files from other password managers.
                      Duplicate entries will be skipped.
                    </p>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={onClose}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleImport}
                      disabled={!importFile || isImporting}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isImporting ? 'Importing...' : 'Import'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-md ${importResult.success ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                    <h3 className={`font-medium ${importResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                      {importResult.success ? 'Import Completed' : 'Import Failed'}
                    </h3>
                    
                    <div className={`mt-2 text-sm ${importResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                      <ul className="space-y-1">
                        <li>✓ Imported: {importResult.imported} passwords</li>
                        <li>⏭ Skipped: {importResult.skipped} entries</li>
                        <li>🔄 Duplicates: {importResult.duplicates} entries</li>
                      </ul>
                      
                      {importResult.errors.length > 0 && (
                        <div className="mt-3">
                          <p className="font-medium">Errors:</p>
                          <ul className="list-disc list-inside mt-1">
                            {importResult.errors.slice(0, 5).map((error, index) => (
                              <li key={index} className="text-xs">{error}</li>
                            ))}
                            {importResult.errors.length > 5 && (
                              <li className="text-xs">... and {importResult.errors.length - 5} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={resetImport}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Import More
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 