# T006 — Permission service + branch grants

## Goal
Triển khai permission theo branch root.

## Required API
- canViewPerson
- canEditPerson
- canAddChild
- canAddSpouse
- canChangeParent
- canGrantBranch
- getManagedBranches
- getEditablePersonIds

## Rules
Editable = lineage descendants(root, include root) + spouses/partners của descendants.
Admin full access. Member ngoài editable chỉ view.

## Acceptance
- Unit test: root, child, grandchild, spouse => edit true.
- Sibling branch => edit false.
- Ancestor => edit false.
- Member cannot grant/revoke.
- PENDING user => all mutation false.
