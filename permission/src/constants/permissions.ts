export enum Roles {
  ADMIN = 'admin',
  USER = 'user',
}

export const permissions = [
  'user_get_by_id',
  'user_confirm',
  'media_search_by_user_id',
  'media_create',
  'media_delete_by_id',
  'media_update_by_id',
  'live_search_by_user_id',
  'live_create',
  'live_join',
  'user_get_all',
];

export const rolePermissions: Record<Roles, string[]> = {
  [Roles.ADMIN]: [
    ...permissions,
  ],
  [Roles.USER]: [
    'user_get_by_id',
    'media_search_by_user_id',
    'media_create',
    'media_delete_by_id',
    'media_update_by_id',
    'live_search_by_user_id',
    'live_create',
    'live_join',
  ],
};
