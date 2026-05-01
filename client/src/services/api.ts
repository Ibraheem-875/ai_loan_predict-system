import axios from 'axios';

/** Axios instance with base URL pointing to our Express backend */
/** Axios instance with base URL pointing to our Express backend */
const api = axios.create({
  // Use VITE_API_BASE_URL if it's a full URL, otherwise force Render URL in production
  baseURL: (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.startsWith('http'))
    ? import.meta.env.VITE_API_BASE_URL
    : (window.location.hostname.includes('vercel.app') 
        ? 'https://ai-loan-predict-system.onrender.com/api' 
        : '/api'),
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

const TOKEN_KEY = 'fincore_auth_token';
const ADMIN_TOKEN_KEY = 'fincore_admin_auth_token';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface AdminAuthResponse {
  token: string;
  admin: AuthUser;
}

export interface AuthPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthPayload {
  name: string;
}

export interface LoanApplicationRecord extends LoanResult {
  _id: string;
  income: number;
  creditScore: number;
  existingEMI: number;
  loanAmount: number;
  tenure: number;
  employment: 'stable' | 'unstable';
  loanPurpose: LoanPurpose;
  documentVerification: DocumentVerification;
  status: 'Applied' | 'Under Review' | 'Approved' | 'Rejected';
  createdAt: string;
}

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const setStoredToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearStoredToken = () => localStorage.removeItem(TOKEN_KEY);
export const getStoredAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);
export const setStoredAdminToken = (token: string) => localStorage.setItem(ADMIN_TOKEN_KEY, token);
export const clearStoredAdminToken = () => localStorage.removeItem(ADMIN_TOKEN_KEY);

api.interceptors.request.use((config) => {
  const requestUrl = config.url ?? '';

  if (config.headers.Authorization) {
    return config;
  }

  if (requestUrl.startsWith('/admin/auth')) {
    return config;
  }

  if (requestUrl.startsWith('/admin/')) {
    const adminToken = getStoredAdminToken();
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    }
    return config;
  }

  const userToken = getStoredToken();
  if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }
  return config;
});

export type LoanPurpose = 'home' | 'car' | 'personal' | 'education';

export interface UploadedDocument {
  uploaded: boolean;
  fileName: string;
  fileType: string;
  fileSize: number;
  url?: string;
  publicId?: string;
}

export interface DocumentVerification {
  aadhaar?: UploadedDocument;
  pan?: UploadedDocument;
  salarySlip?: UploadedDocument;
}

export interface CloudinaryUploadResponse {
  url: string;
  publicId: string;
  docType: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

/**
 * POST /api/upload-document
 * Upload a document file to Cloudinary via the backend.
 */
export const uploadDocumentToCloud = async (
  file: File,
  docType: 'aadhaar' | 'pan' | 'salarySlip'
): Promise<CloudinaryUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('docType', docType);

  const response = await api.post<CloudinaryUploadResponse>('/upload-document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return response.data;
};

/**
 * DELETE /api/delete-document
 * Remove a document from Cloudinary by its publicId.
 */
export const deleteDocumentFromCloud = async (publicId: string): Promise<void> => {
  await api.delete('/delete-document', { data: { publicId } });
};


/** Shape of the loan analysis request body */
export interface LoanInput {
  income: number;
  creditScore: number;
  existingEMI: number;
  loanAmount: number;
  tenure: number;
  employment: 'stable' | 'unstable';
  loanPurpose: LoanPurpose;
  documentVerification: DocumentVerification;
}

/** Shape of the analysis response */
export interface LoanResult {
  eligible: boolean;
  score: number;
  probability: number;
  risk: 'Low' | 'Medium' | 'High';
  emi: number;
  interestRate: number;
  recommendedLoan: number;
  totalPayable: number;
  reasons: string[];
  suggestions: string[];
  loanPurpose: LoanPurpose;
  documentStatus?: {
    uploadedCount: number;
    requiredCount: number;
    complete: boolean;
  };
  purposeAnalysis?: {
    type: string;
    minimumCreditScore: number;
    maxTenure: number;
    maxEmiRatio: number;
    note: string;
    purposeEligible: boolean;
  };
  ai?: {
    summary: string;
    explanation: string;
    riskAnalysis: string;
    suggestions: string[];
  };
  applicationId?: string;
}

export const registerUser = async (data: RegisterPayload): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', data);
  return response.data;
};

export const loginUser = async (data: AuthPayload): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', data);
  return response.data;
};

export const fetchMe = async (): Promise<{ user: AuthUser }> => {
  const response = await api.get<{ user: AuthUser }>('/auth/me');
  return response.data;
};

export const registerAdmin = async (data: RegisterPayload): Promise<AdminAuthResponse> => {
  const response = await api.post<AdminAuthResponse>('/admin/auth/register', data);
  return response.data;
};

export const loginAdmin = async (data: AuthPayload): Promise<AdminAuthResponse> => {
  const response = await api.post<AdminAuthResponse>('/admin/auth/login', data);
  return response.data;
};

export const fetchAdminMe = async (): Promise<{ admin: AuthUser }> => {
  const response = await api.get<{ admin: AuthUser }>('/admin/auth/me');
  return response.data;
};

/**
 * POST /api/analyze-loan
 * Send applicant data and receive the full analysis.
 */
export const analyzeLoan = async (data: LoanInput): Promise<LoanResult> => {
  const response = await api.post<LoanResult>('/analyze-loan', data);
  return response.data;
};

/**
 * PATCH /api/loan-status/:id
 * Update the status of an existing application.
 */
export const updateLoanStatus = async (
  id: string,
  status: string
): Promise<{ status: string }> => {
  const response = await api.patch(`/loan-status/${id}`, { status });
  return response.data;
};

export const fetchApplications = async (): Promise<{ applications: LoanApplicationRecord[] }> => {
  const response = await api.get<{ applications: LoanApplicationRecord[] }>('/applications');
  return response.data;
};

export interface AdminStats {
  totalUsers: number;
  totalApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  approvalRatio: number;
  pendingApplications: number;
}

export const fetchAdminStats = async (): Promise<AdminStats> => {
  const response = await api.get<AdminStats>('/admin/stats');
  return response.data;
};

export default api;
