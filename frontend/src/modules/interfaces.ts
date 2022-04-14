export interface TokenObject {
  token: string;
  timestamp?: number;
}

export interface User {
  email: string;
  password: string;
}

interface Pictures {
  id: number,
  path: string,
  metadata: object[];
}

export interface GalleryData {
  objects: Pictures[];
  page: number;
  total: number;
}











