export function generateCategory(name) {
  return { name, type: 4 }; // 4 = Category
}

export function generateChannel(name, type="text", category=null, permissions={}) {
  return { name, type, category, permissions };
}

