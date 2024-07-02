let personId = 0;
export function generatePersonId() {
  return personId++;
}

export interface Person {
	id: number;
	name: string;
	birthday: Date;
}
