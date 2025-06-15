export interface Policy {
  id: string;
  name: string;
  path: string;
  content: string;
  description?: string;
  status: 'active' | 'draft' | 'disabled';
  lastModified: Date;
  author: string;
  version: string;
  tags: string[];
}

export interface PolicyValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  compilationTime?: number;
}

export interface ValidationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  line: number;
  column: number;
  message: string;
  suggestion?: string;
}

export interface TestCase {
  id: string;
  name: string;
  input: any;
  expectedOutput: any;
  description?: string;
}

export interface TestResult {
  testCaseId: string;
  passed: boolean;
  actualOutput: any;
  executionTime: number;
  error?: string;
}

export interface PolicyTest {
  policyId: string;
  testCases: TestCase[];
  results?: TestResult[];
  lastRun?: Date;
}

export interface GitCommit {
  hash: string;
  author: string;
  message: string;
  date: Date;
  filesChanged: string[];
}

export interface AuditEntry {
  id: string;
  policyId: string;
  action: 'created' | 'updated' | 'deleted' | 'tested' | 'deployed';
  timestamp: Date;
  user: string;
  details: string;
  commit?: GitCommit;
}

export interface DashboardStats {
  totalPolicies: number;
  activePolicies: number;
  draftPolicies: number;
  disabledPolicies: number;
  recentTests: number;
  testsPassing: number;
  testsFailing: number;
  lastDeployment?: Date;
} 