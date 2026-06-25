/**
 * API Client for ShoulderSim AI Backend
 * Handles authentication, error handling, and typed API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.loadTokens();
  }

  // Token management
  private loadTokens() {
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  private saveTokens(tokens: AuthTokens) {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
  }

  private clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // Request helper
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Try to refresh token
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          headers['Authorization'] = `Bearer ${this.accessToken}`;
          return fetch(url, { ...options, headers }).then(res => res.json());
        } else {
          this.clearTokens();
          window.location.href = '/login';
          throw new Error('Session expired');
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(error.detail || error.message || 'Request failed');
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      });

      if (response.ok) {
        const tokens = await response.json();
        this.saveTokens(tokens);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  // Authentication
  async login(email: string, password: string): Promise<AuthTokens> {
    const tokens = await this.request<AuthTokens>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.saveTokens(tokens);
    return tokens;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/v1/auth/logout', { method: 'POST' });
    } finally {
      this.clearTokens();
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Scans API
  async uploadScan(patientId: string, files: File[]): Promise<any> {
    const formData = new FormData();
    formData.append('patient_id', patientId);
    files.forEach(file => formData.append('files', file));

    return this.request('/api/v1/scans/upload', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  async getScanStatus(scanId: string): Promise<any> {
    return this.request(`/api/v1/scans/${scanId}/status`);
  }

  async getScanMeshes(scanId: string): Promise<any> {
    return this.request(`/api/v1/scans/${scanId}/meshes`);
  }

  async downloadMesh(scanId: string, tissueType: string): Promise<any> {
    return this.request(`/api/v1/scans/${scanId}/meshes/${tissueType}`);
  }

  async generateAnatomyModel(scanId: string): Promise<any> {
    return this.request(`/api/v1/scans/${scanId}/model`, {
      method: 'POST',
    });
  }

  // Simulations API
  async triggerROMSimulation(params: {
    scan_id: string;
    abduction_range: [number, number];
    flexion_range: [number, number];
    rotation_range: [number, number];
    resolution_degrees: number;
  }): Promise<any> {
    return this.request('/api/v1/simulations/rom', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async triggerFEASimulation(params: {
    scan_id: string;
    loading_scenario: string;
    load_kg: number;
    material_properties?: any;
  }): Promise<any> {
    return this.request('/api/v1/simulations/fea', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async triggerMuscleForceSimulation(params: {
    scan_id: string;
    movement_type: string;
  }): Promise<any> {
    return this.request('/api/v1/simulations/muscle-forces', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getSimulationStatus(jobId: string): Promise<any> {
    return this.request(`/api/v1/simulations/${jobId}/status`);
  }

  async getSimulationResults(jobId: string): Promise<any> {
    return this.request(`/api/v1/simulations/${jobId}/results`);
  }

  // AI API
  async getSuccessPrediction(scanId: string): Promise<any> {
    return this.request('/api/v1/ai/success-predictor/predict', {
      method: 'POST',
      body: JSON.stringify({ scan_id: scanId }),
    });
  }

  async getOutcomePrediction(scanId: string, implantConfig: any): Promise<any> {
    return this.request('/api/v1/ai/outcome-learner/predict', {
      method: 'POST',
      body: JSON.stringify({ scan_id: scanId, implant_config: implantConfig }),
    });
  }

  async getImplantRecommendation(scanId: string): Promise<any> {
    return this.request('/api/v1/ai/implant-recommender/predict', {
      method: 'POST',
      body: JSON.stringify({ scan_id: scanId }),
    });
  }

  async getMobilityForecast(scanId: string, implantConfig: any, surgeryNotes: string): Promise<any> {
    return this.request('/api/v1/ai/mobility-forecaster/predict', {
      method: 'POST',
      body: JSON.stringify({
        scan_id: scanId,
        implant_config: implantConfig,
        surgery_notes: surgeryNotes,
      }),
    });
  }

  async overrideAIRecommendation(params: {
    scan_id: string;
    prediction_id: string;
    reason: string;
  }): Promise<any> {
    return this.request('/api/v1/ai/override', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Regulatory API
  async createRiskItem(risk: any): Promise<any> {
    return this.request('/api/v1/regulatory/risks', {
      method: 'POST',
      body: JSON.stringify(risk),
    });
  }

  async getRiskItems(filters?: { status?: string; risk_level?: string }): Promise<any> {
    const params = new URLSearchParams(filters as any);
    return this.request(`/api/v1/regulatory/risks?${params}`);
  }

  async reportAdverseEvent(event: any): Promise<any> {
    return this.request('/api/v1/regulatory/adverse-events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  async getAdverseEvents(status?: string): Promise<any> {
    const params = status ? `?status=${status}` : '';
    return this.request(`/api/v1/regulatory/adverse-events${params}`);
  }

  async createUsabilitySession(session: any): Promise<any> {
    return this.request('/api/v1/regulatory/usability-sessions', {
      method: 'POST',
      body: JSON.stringify(session),
    });
  }

  async getUsabilitySessions(sessionType?: string): Promise<any> {
    const params = sessionType ? `?session_type=${sessionType}` : '';
    return this.request(`/api/v1/regulatory/usability-sessions${params}`);
  }

  // Clinical Integration API
  async getDICOMWebStudies(patientId?: string, modality?: string): Promise<any> {
    const params = new URLSearchParams();
    if (patientId) params.append('patient_id', patientId);
    if (modality) params.append('modality', modality);
    return this.request(`/api/v1/clinical/dicomweb/studies?${params}`);
  }

  async retrieveDICOMSeries(studyId: string, seriesId?: string): Promise<any> {
    const params = seriesId ? `?series_id=${seriesId}` : '';
    return this.request(`/api/v1/clinical/dicomweb/studies/${studyId}/retrieve${params}`, {
      method: 'POST',
    });
  }

  async getFHIRPatients(name?: string, birthdate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (birthdate) params.append('birthdate', birthdate);
    return this.request(`/api/v1/clinical/fhir/Patient?${params}`);
  }

  async getFHIRImagingStudies(patient?: string): Promise<any> {
    const params = patient ? `?patient=${patient}` : '';
    return this.request(`/api/v1/clinical/fhir/ImagingStudy${params}`);
  }

  async getCDSHookRecommendation(hookId: string, context: any): Promise<any> {
    return this.request('/api/v1/clinical/cds-hooks/recommend', {
      method: 'POST',
      body: JSON.stringify({ hook_id: hookId, context }),
    });
  }

  async getModalityWorklist(): Promise<any> {
    return this.request('/api/v1/clinical/worklist');
  }

  async exportDICOMStructuredReport(planId: string): Promise<any> {
    return this.request(`/api/v1/clinical/export/dicom-sr`, {
      method: 'POST',
      body: JSON.stringify({ plan_id: planId }),
    });
  }

  // Surgical Plans API
  async createSurgicalPlan(plan: any): Promise<any> {
    return this.request('/api/v1/plans', {
      method: 'POST',
      body: JSON.stringify(plan),
    });
  }

  async getSurgicalPlan(planId: string): Promise<any> {
    return this.request(`/api/v1/plans/${planId}`);
  }

  async updateSurgicalPlan(planId: string, updates: any): Promise<any> {
    return this.request(`/api/v1/plans/${planId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async lockSurgicalPlan(planId: string): Promise<any> {
    return this.request(`/api/v1/plans/${planId}/lock`, {
      method: 'POST',
    });
  }

  async exportPlanPDF(planId: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/v1/plans/${planId}/export-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.accessToken ? { 'Authorization': `Bearer ${this.accessToken}` } : {}),
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error('Failed to export PDF');
    }

    return response.blob();
  }

  // Health check
  async healthCheck(): Promise<any> {
    return this.request('/health');
  }

  async apiStatus(): Promise<any> {
    return this.request('/api/v1/status');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types for use in components
export type { AuthTokens };
