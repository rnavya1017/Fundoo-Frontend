export interface Note {
  id: string;
  title: string;
  content: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  trashed: boolean;
  pinned: boolean;
  reminderAt?: string;
  reminderRepeat?: string;
  labels?: Label[];
}

export interface Label {
  id: number;
  name: string;
}

export interface BackendNoteResponse {
  id: number;
  title: string;
  description?: string | null;
  color?: string | null;
  pinned: boolean;
  archived: boolean;
  trashed: boolean;
  createdDate: string;
  updatedDate: string;
  reminderDate?: string | null;
  labels?: Label[];
}
