export interface Contact {
  id: string;
  rank: string;
  first_name: string;
  last_name: string;
  unit: string;
  company: string;
  workplace: string;
  phone: string;
  line_id: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ContactRequest {
  id: string;
  type: string;
  rank: string;
  first_name: string;
  last_name: string;
  unit: string;
  company: string;
  workplace: string;
  phone: string;
  line_id: string;
  notes: string;
  requester_name: string;
  requester_phone: string;
  status: "pending" | "approved" | "rejected";
  contact_id: string | null;
  edit_data: Record<string, string> | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export type EventStatus = "survey" | "upcoming" | "confirmed" | "in_progress" | "ended";

export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  status: EventStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type NewsCategory = "pr" | "congratulations" | "condolence" | "other";

export interface News {
  id: string;
  title: string;
  content: string;
  category: NewsCategory;
  created_by: string;
  created_at: string;
  expires_at: string | null;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  image_url: string;
  close_date: string;
  created_by: string;
  created_at: string;
}

export interface SurveyImage {
  id: string;
  survey_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface NewsImage {
  id: string;
  news_id: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface SurveyOption {
  id: string;
  survey_id: string;
  label: string;
  sort_order: number;
  created_at: string;
}

export interface SurveyVote {
  id: string;
  survey_id: string;
  option_id: string;
  voter_name: string;
  created_at: string;
}

export interface Post {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  content: string;
  author_name: string;
  created_at: string;
}
