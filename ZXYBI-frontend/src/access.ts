/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const {currentUser} = initialState ?? {};
  const isAdmin = currentUser && currentUser.userRole === 'admin';
  return {
    canAdmin: isAdmin,
    canUser: currentUser && !isAdmin,
  };
}
