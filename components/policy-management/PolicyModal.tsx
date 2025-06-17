"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Policy, policyAPI, ValidateResponse } from "@/lib/api";

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy?: Policy | null;
  onSave: (policy: Policy) => void;
}

export function PolicyModal({ isOpen, onClose, policy, onSave }: PolicyModalProps) {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    content: string;
    status: "draft" | "active" | "inactive";
    version: string;
  }>({
    name: "",
    description: "",
    content: "",
    status: "draft",
    version: "0.1.0",
  });

  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidateResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when modal opens/closes or policy changes
  useEffect(() => {
    if (isOpen) {
      if (policy) {
        setFormData({
          name: policy.name,
          description: policy.description,
          content: policy.content,
          status: policy.status,
          version: policy.version,
        });
      } else {
        setFormData({
          name: "",
          description: "",
          content: `package example

default allow = false

allow {
    input.user.role == "admin"
}`,
          status: "draft",
          version: "0.1.0",
        });
      }
      setValidationResult(null);
    }
  }, [isOpen, policy]);

  const handleValidate = async () => {
    if (!formData.content.trim()) return;

    setIsValidating(true);
    try {
      const result = await policyAPI.validatePolicy({ policy: formData.content });
      setValidationResult(result);
    } catch (error) {
      console.error("Validation error:", error);
      setValidationResult({
        valid: false,
        errors: ["Błąd połączenia z serwerem walidacji"],
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const policyData = {
        ...formData,
        tests: policy?.tests || 0,
        testsStatus: "pending" as const,
      };

      let savedPolicy: Policy;
      if (policy) {
        savedPolicy = await policyAPI.updatePolicy(policy.id, policyData);
      } else {
        savedPolicy = await policyAPI.createPolicy(policyData);
      }

      onSave(savedPolicy);
      onClose();
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const isFormValid = formData.name.trim() && formData.description.trim() && formData.content.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {policy ? "Edytuj Policy" : "Nowa Policy"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nazwa Policy</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="np. RBAC Policy"
              />
            </div>
            <div>
              <Label htmlFor="version">Wersja</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="np. 1.0.0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Opis</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Krótki opis policy"
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: "draft" | "active" | "inactive") => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Szkic</SelectItem>
                <SelectItem value="active">Aktywna</SelectItem>
                <SelectItem value="inactive">Nieaktywna</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="content">Treść Policy (Rego)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleValidate}
                disabled={isValidating || !formData.content.trim()}
              >
                {isValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Waliduj
              </Button>
            </div>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="package example..."
              className="font-mono text-sm min-h-[300px]"
            />
            
            {validationResult && (
              <div className="mt-2">
                {validationResult.valid ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Policy jest poprawna
                  </Badge>
                ) : (
                  <div>
                    <Badge className="bg-red-100 text-red-800 mb-2">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Błędy w policy
                    </Badge>
                    {validationResult.errors && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {validationResult.errors.map((error, index) => (
                          <div key={index}>• {error}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Anuluj
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!isFormValid || isSaving}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {policy ? "Zapisz zmiany" : "Utwórz Policy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 