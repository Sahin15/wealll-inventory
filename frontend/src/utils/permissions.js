export const permissions = {
  admin: [
    'settings.manage',
    'team.manage',
    'products.manage',
    'categories.manage',
    'stock.manage',
    'purchases.manage',
    'sales.create',
    'sales.void',
    'purchases.void',
    'analytics.view'
  ],
  manager: [
    'products.manage',
    'categories.manage',
    'stock.manage',
    'purchases.manage',
    'sales.create',
    'sales.void',
    'purchases.void',
    'analytics.view'
  ],
  staff: [
    'products.view',
    'categories.view',
    'stock.view',
    'sales.create'
  ]
};

export const hasPermission = (role, permission) => {
  if (!permissions[role]) return false;
  return permissions[role].includes(permission);
};
