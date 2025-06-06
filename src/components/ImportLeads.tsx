import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { Lead } from '@/types/Lead';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ImportLeadsProps {
  onImport: (leads: Omit<Lead, 'id' | 'created_at' | 'meeting_summaries'>[]) => void;
  onClose: () => void;
}

const ImportLeads = ({ onImport, onClose }: ImportLeadsProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({
    company_name: '',
    email: '',
    contact_number: '',
    lead_source: '',
    status: '',
    potential: '',
    requirements: '',
    address: '',
  });
  const [headers, setHeaders] = useState<string[]>([]);
  const [preview, setPreview] = useState<any[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        if (jsonData.length > 0) {
          const headers = jsonData[0] as string[];
          setHeaders(headers);
          setPreview(jsonData.slice(1, 4)); // Show first 3 rows as preview
          
          // Try to auto-map headers
          const autoMapping: Record<string, string> = {};
          headers.forEach(header => {
            const lowerHeader = header.toLowerCase();
            if (lowerHeader.includes('company') || lowerHeader.includes('name')) {
              autoMapping.company_name = header;
            } else if (lowerHeader.includes('email')) {
              autoMapping.email = header;
            } else if (lowerHeader.includes('phone') || lowerHeader.includes('contact') || lowerHeader.includes('mobile')) {
              autoMapping.contact_number = header;
            } else if (lowerHeader.includes('source')) {
              autoMapping.lead_source = header;
            } else if (lowerHeader.includes('status')) {
              autoMapping.status = header;
            } else if (lowerHeader.includes('potential')) {
              autoMapping.potential = header;
            } else if (lowerHeader.includes('requirement')) {
              autoMapping.requirements = header;
            } else if (lowerHeader.includes('address')) {
              autoMapping.address = header;
            }
          });
          setMapping(autoMapping);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to read the Excel file. Please make sure it's a valid Excel file.",
          variant: "destructive",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = () => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        const leads = jsonData.map((row: any) => {
          const lead: any = {
            company_name: row[mapping.company_name] || 'Unknown Company',
            email: row[mapping.email] || '',
            contact_number: row[mapping.contact_number] || '',
            lead_source: row[mapping.lead_source] || 'import',
            status: (row[mapping.status] || 'new').toLowerCase(),
            potential: parseInt(row[mapping.potential]) || 0,
            requirements: row[mapping.requirements] || '',
            address: row[mapping.address] || '',
            assigned_to: '',
            user_id: '',
            updated_at: new Date().toISOString(),
          };

          // Only validate company name as required
          if (!lead.company_name) {
            throw new Error(`Missing company name for a lead`);
          }

          return lead;
        });

        onImport(leads);
        onClose();
        toast({
          title: "Success",
          description: `Successfully imported ${leads.length} leads`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to import leads",
          variant: "destructive",
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Import Leads</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file">Excel File</Label>
          <div className="flex items-center gap-2">
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="flex-1"
            />
            <Button variant="outline" size="icon" onClick={() => setFile(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {headers.length > 0 && (
          <div className="space-y-4">
            <div className="text-sm font-medium">Map Excel Columns</div>
            <div className="grid gap-4">
              {Object.entries(mapping).map(([key, value]) => (
                <div key={key} className="grid grid-cols-2 gap-2 items-center">
                  <Label className="capitalize">{key.replace('_', ' ')}</Label>
                  <Select
                    value={value}
                    onValueChange={(newValue) => setMapping({ ...mapping, [key]: newValue })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {preview.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Preview</div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {headers.map((header) => (
                          <th key={header} className="px-4 py-2 text-left font-medium text-gray-500">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, i) => (
                        <tr key={i} className="border-t">
                          {headers.map((header) => (
                            <td key={header} className="px-4 py-2">
                              {row[header] || ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleImport}>
                <Upload className="h-4 w-4 mr-2" />
                Import Leads
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImportLeads; 