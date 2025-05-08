export interface BeeperModel {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

export interface SoldBeeper {
  id: string; // UUID
  model_id: number;
  model_name: string;
  purchase_timestamp: string; // ISO format string
  status: "active" | "activated";
}

export interface CartItem extends BeeperModel {
  quantity: number;
}
