export type FromClient =
  | {
      type: "url";
      url: string;
    }
  | {
      type: "mouse";
      x: number;
      y: number;
    };

export type FromServer =
  | {
      type: "url";
      url: string;
      sender: string;
    }
  | {
      type: "mouse";
      x: number;
      y: number;
      sender: string;
    };
