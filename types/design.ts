export interface Design {
  name: string;
  url: string;
  blob_path: string;
  updated: string;
}

export interface DesignExpanderProps {
  design: Design | null;
  onClose: () => void;
  onDownload: (name: string) => void;
}

export interface Generation {
  generation_id: string;
  material_id: string;
  created_at: string;
  image_url: string;
  image_blob_path: string;
}

export interface WorkflowWithGeneration {
  id: string;
  name: string;
  status: string;
  sketch_url: string;
  generations_count: number;
  sketch_blob_path: string;
  created_at: string;
  updated_at: string;
  latest_generation: Generation;
}
