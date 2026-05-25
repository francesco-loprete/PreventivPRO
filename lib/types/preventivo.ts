export type Preventivo = {
  id: number;
  cliente: string;
  descrizione: string;
  prezzo: number;
  user_id?: string;
};

export type PreventivoInsert = Pick<
  Preventivo,
  "cliente" | "descrizione" | "prezzo"
> & {
  user_id?: string;
};
