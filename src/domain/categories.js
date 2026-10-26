// Ordena categorías para selects jerárquicos: padres primero (por sort_order), con sus
// hijas justo debajo marcadas con isParent:false (para indentarlas con "  ↳ " al renderizar).
// Única fuente de verdad — antes esta lógica estaba duplicada en TransactionForm.jsx,
// TransactionFormProjected.jsx y Budgets.jsx.
export function buildCategoryTree(categories = []) {
    const sorted = [...categories].sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
    const parents = sorted.filter((c) => !c.parent_category);
    const children = sorted.filter((c) => !!c.parent_category);
    const ordered = [];
    parents.forEach((p) => {
        ordered.push({ ...p, isParent: true });
        children.filter((c) => c.parent_category === p.id).forEach((c) => ordered.push({ ...c, isParent: false }));
    });
    // Huérfanas: su padre no está en la lista filtrada (ej. quedó en otro tipo/tab).
    children.filter((c) => !parents.find((p) => p.id === c.parent_category)).forEach((c) => ordered.push({ ...c, isParent: false }));
    return ordered;
}
