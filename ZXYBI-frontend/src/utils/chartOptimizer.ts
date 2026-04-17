/**
 * ECharts 配置优化工具
 * 用于修复 AI 生成的图表配置中 title 和 legend 重叠等问题
 */

/**
 * 判断图表类型
 * @param option ECharts 配置
 * @returns 图表类型
 */
const getChartType = (option: any): string => {
  if (!option || !option.series || !Array.isArray(option.series)) {
    return '';
  }

  const firstSeries = option.series[0];
  if (!firstSeries || !firstSeries.type) {
    return '';
  }

  return firstSeries.type.toLowerCase();
};

/**
 * 优化 ECharts 配置，避免 title 和 legend 重叠
 * @param option 原始 ECharts 配置
 * @returns 优化后的 ECharts 配置
 */
export const optimizeChartOption = (option: any): any => {
  if (!option || typeof option !== 'object') {
    return option;
  }

  // 深拷贝配置，避免修改原对象
  const optimizedOption = JSON.parse(JSON.stringify(option));

  // 确保 grid 有合适的 top 值，为 title 和 legend 留出空间
  if (!optimizedOption.grid) {
    optimizedOption.grid = {};
  }

  // 根据是否有 title 和 legend 动态调整 grid.top
  const hasTitle = optimizedOption.title && optimizedOption.title.text;
  const hasLegend = optimizedOption.legend && optimizedOption.legend.data;

  // 设置默认的 grid.top 值
  let gridTop = 60;

  // 如果同时有 title 和 legend，需要更多空间
  if (hasTitle && hasLegend) {
    gridTop = 80;
  } else if (hasTitle || hasLegend) {
    gridTop = 60;
  }

  // 确保 grid.top 有足够的空间
  if (!optimizedOption.grid.top || optimizedOption.grid.top < gridTop) {
    optimizedOption.grid.top = gridTop;
  }

  // 优化 title 配置
  if (hasTitle) {
    // 确保 title 有合适的位置
    if (!optimizedOption.title.top) {
      optimizedOption.title.top = 10;
    }
    if (!optimizedOption.title.left) {
      optimizedOption.title.left = 'center';
    }

    // 设置 title 的样式，避免过大
    if (!optimizedOption.title.textStyle) {
      optimizedOption.title.textStyle = {};
    }
    if (!optimizedOption.title.textStyle.fontSize) {
      optimizedOption.title.textStyle.fontSize = 14;
    }
  }

  // 优化 legend 配置
  if (hasLegend) {
    // 确保 legend 有合适的位置，放在 title 下方
    if (!optimizedOption.legend.top) {
      // 如果有 title，legend 放在 title 下方
      optimizedOption.legend.top = hasTitle ? 35 : 10;
    }

    // 设置 legend 的类型为 scroll，避免图例过多时占用太多空间
    if (!optimizedOption.legend.type) {
      optimizedOption.legend.type = 'scroll';
    }

    // 设置 legend 的布局
    if (!optimizedOption.legend.left) {
      optimizedOption.legend.left = 'center';
    }

    // 限制 legend 的最大宽度
    if (!optimizedOption.legend.maxWidth) {
      optimizedOption.legend.maxWidth = '80%';
    }
  }

  // 对于饼图、玫瑰图等特殊图表类型，需要特殊处理
  const chartType = getChartType(optimizedOption);
  if (chartType === 'pie' || chartType === 'funnel' || chartType === 'gauge') {
    // 饼图等特殊图表不需要 grid
    delete optimizedOption.grid;

    // 确保 legend 不会与饼图重叠
    if (hasLegend) {
      optimizedOption.legend.orient = 'vertical';
      optimizedOption.legend.right = 10;
      optimizedOption.legend.top = 'middle';
    }
  }

  return optimizedOption;
};

/**
 * 批量优化多个图表配置
 * @param options 图表配置数组
 * @returns 优化后的图表配置数组
 */
export const optimizeChartOptions = (options: any[]): any[] => {
  if (!Array.isArray(options)) {
    return [];
  }
  return options.map(option => optimizeChartOption(option));
};
