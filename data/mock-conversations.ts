import type { Conversation } from "@/types/conversation"

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "demo-conv-1",
    title: "scRNA数据质量控制分析",
    messages: [
      {
        id: "msg-1-1",
        type: "user",
        content:
          "我有一个单细胞RNA测序数据集，包含约10000个细胞，需要进行质量控制和初步分析。数据格式是10X Genomics的输出格式。",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      },
      {
        id: "msg-1-2",
        type: "agent",
        content: `## 任务调度完成

我已经分析了您的scRNA数据分析需求，并制定了以下处理计划：

1. **数据预处理** - 检查10X Genomics数据格式和完整性
2. **质量控制** - 应用标准QC流程，包括细胞和基因过滤
3. **分析处理** - 执行标准化、降维和聚类分析
4. **结果整理** - 生成质量控制报告和可视化图表

正在启动后续Agent执行具体任务...`,
        agent: "调度Agent",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 30000),
      },
      {
        id: "msg-1-3",
        type: "agent",
        content: `## scRNA数据处理完成

### 数据概览
- **细胞数量**: 9,847个细胞
- **基因数量**: 25,156个基因
- **质控后细胞**: 8,923个细胞 (90.6%)

### 处理步骤
1. ✅ 数据加载和格式验证
2. ✅ 质量控制指标计算
3. ✅ 细胞和基因过滤
4. ✅ 标准化和缩放
5. ✅ 主成分分析 (PCA)
6. ✅ 聚类分析

### 主要发现
- 识别出**14个细胞群**
- 发现**189个差异表达基因**
- 细胞类型注释准确率: **92.8%**

### 质量控制结果
- 平均基因数/细胞: 2,847
- 平均UMI数/细胞: 8,234
- 线粒体基因比例: 8.3%`,
        agent: "scRNA数据处理Agent",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 120000),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 120000),
    preview: "我有一个单细胞RNA测序数据集，包含约10000个细胞，需要进行质量控制和初步分析...",
    isStarred: true,
  },
  {
    id: "demo-conv-2",
    title: "文献知识提取与总结",
    messages: [
      {
        id: "msg-2-1",
        type: "user",
        content: "请帮我从最新的Nature和Cell期刊中提取关于免疫细胞分化的相关研究，重点关注T细胞亚群的转录调控机制。",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      },
      {
        id: "msg-2-2",
        type: "agent",
        content: `## 知识提取结果

从相关文献和数据库中提取到以下关键信息：

### 相关研究进展
- **T细胞亚群**: 识别出18种主要T细胞亚型
- **转录因子**: 发现42个关键转录调控因子
- **信号通路**: 涉及5条重要的分化调控通路

### 重要发现
1. **Th17细胞分化**: RORγt和STAT3协同调控机制
2. **Treg细胞维持**: Foxp3表观遗传修饰的新机制
3. **CD8+ T细胞记忆**: TCF1在记忆形成中的关键作用

### 参考文献
1. Nature (2024) - "Transcriptional control of T cell differentiation"
2. Cell (2024) - "Epigenetic regulation in immune cell development"
3. Nature Immunology (2024) - "Single-cell analysis of T cell heterogeneity"

数据已整理完成，可用于后续深入分析。`,
        agent: "知识提取Agent",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 180000),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 + 180000),
    preview: "请帮我从最新的Nature和Cell期刊中提取关于免疫细胞分化的相关研究...",
    isStarred: false,
  },
  {
    id: "demo-conv-3",
    title: "数据过滤与预处理",
    messages: [
      {
        id: "msg-3-1",
        type: "user",
        content: "我的数据集中有很多低质量的细胞和基因，需要进行严格的质量控制和过滤。请帮我设计一个合适的过滤策略。",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
      },
      {
        id: "msg-3-2",
        type: "agent",
        content: `## 数据过滤结果

### 过滤统计
- **原始细胞数**: 12,547
- **过滤后细胞数**: 10,234 (保留81.6%)
- **原始基因数**: 28,156  
- **过滤后基因数**: 19,847 (保留70.5%)

### 过滤标准
- **细胞过滤**: 
  - 基因数 > 500 且 < 7000
  - 线粒体基因比例 < 15%
  - 核糖体基因比例 < 40%
  - 双细胞评分 < 0.3

- **基因过滤**:
  - 至少在5个细胞中表达
  - 平均表达量 > 0.05
  - 排除线粒体和核糖体基因

### 质量提升
- 降噪效果: **88.7%**
- 信号纯度: **94.2%**
- 批次效应校正: **完成**`,
        agent: "数据过滤Agent",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6 + 90000),
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6 + 90000),
    preview: "我的数据集中有很多低质量的细胞和基因，需要进行严格的质量控制和过滤...",
    isStarred: false,
  },
]

export const DEMO_QUESTIONS = [
  {
    category: "scRNA数据分析",
    questions: [
      "请帮我分析这个单细胞RNA测序数据，包含15000个细胞",
      "我需要对scRNA数据进行质量控制和细胞类型注释",
      "如何识别差异表达基因和功能富集分析？",
      "请帮我进行细胞轨迹分析和伪时间推断",
    ],
  },
  {
    category: "知识提取",
    questions: [
      "从最新文献中提取关于癌症免疫治疗的研究进展",
      "总结干细胞分化相关的转录调控网络",
      "提取神经退行性疾病的分子机制研究",
      "分析表观遗传修饰在发育中的作用机制",
    ],
  },
  {
    category: "数据处理",
    questions: [
      "我的数据需要批次效应校正和标准化处理",
      "请帮我设计合适的数据过滤和质控策略",
      "如何处理缺失值和异常值检测？",
      "需要进行多组学数据整合分析",
    ],
  },
]
