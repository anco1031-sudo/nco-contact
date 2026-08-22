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

export interface Request {
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
  requester_name: string;
  requester_phone: string;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}
