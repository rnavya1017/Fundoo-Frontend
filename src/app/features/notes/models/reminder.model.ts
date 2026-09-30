export interface ReminderRequest {
  reminderTime: string;
}

export interface ReminderResponse {
  id: number;
  noteId: number;
  noteTitle: string;
  reminderTime: string;
  status: string;
}
