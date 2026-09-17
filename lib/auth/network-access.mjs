// Verified founder accounts; never grant access by editable names or revenue rank.
const founderIds=new Set(['1f0ff6f6-47f6-433f-9ac3-137473003af2','4b829d44-616b-4dff-b5d6-eded9035874d'])
export function canViewFullNetwork(user){return !!user&&!user.blocked&&!user.impersonatedBy&&founderIds.has(user.id)}
