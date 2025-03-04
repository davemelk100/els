export interface Experience {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  created_at: string;
  votes: number;
  user_id: string;
  responses: Response[];
}

export interface Response {
  id: string;
  text: string;
  helpful: boolean;
  user_id: string;
  created_at: string;
}
