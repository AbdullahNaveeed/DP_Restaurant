export function computeStatsFromOrders(orders) {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + (Number(order.totalAmount) || 0),
    0
  );

  const statusCounts = { Pending: 0, Preparing: 0, Delivered: 0 };
  orders.forEach((order) => {
    if (Object.prototype.hasOwnProperty.call(statusCounts, order.status)) {
      statusCounts[order.status] += 1;
    }
  });

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return { totalOrders, totalRevenue, statusCounts, recentOrders };
}
