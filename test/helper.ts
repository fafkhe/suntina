
const context = new Map();

export function SetContext(key: string, value: any) {
  context.set(key, value);
}


export function GetContext(key: string): any {
  return context.get(key);
}

export function printContext() {
  console.log(context)
}