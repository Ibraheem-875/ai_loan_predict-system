import axios from 'axios';

/** Axios instance with base URL pointing to our Express backend */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://ai-loan-predict-system.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 45000, // 45 seconds to accommodate Gemini API latency (was 10 seconds)
});

const TOKEN_KEY = 'fincore_auth_token';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
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
  status: 'Applied' | 'Under Review' | 'Approved' | 'Rejected';
  createdAt: string;
}

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const setStoredToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearStoredToken = () => localStorage.removeItem(TOKEN_KEY);

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Shape of the loan analysis request body */
export interface LoanInput {
  income: number;
  creditScore: number;
  existingEMI: number;
  loanAmount: number;
  tenure: number;
  employment: 'stable' | 'unstable';
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

export default api;
