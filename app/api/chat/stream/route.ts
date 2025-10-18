import type { NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const { message, files } = await request.json()

  // Create a readable stream for SSE
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Determine required agents based on message content
        const agents = determineRequiredAgents(message)

        // Send initial workflow info
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "workflow_start",
              agents: agents.map((type) => ({ type, name: getAgentName(type) })),
            })}\n\n`,
          ),
        )

        // Process each agent sequentially
        for (let i = 0; i < agents.length; i++) {
          const agentType = agents[i]
          const agentName = getAgentName(agentType)

          // Start agent
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "agent_start",
                agent: { type: agentType, name: agentName },
                index: i,
              })}\n\n`,
            ),
          )

          // Simulate processing with progress updates
          const steps = 20
          for (let step = 0; step <= steps; step++) {
            const progress = (step / steps) * 100

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "agent_progress",
                  agent: { type: agentType, name: agentName },
                  progress: Math.round(progress),
                })}\n\n`,
              ),
            )

            // Send intermediate messages
            if (step === Math.floor(steps / 3)) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "agent_message",
                    agent: { type: agentType, name: agentName },
                    content: `${agentName}开始分析数据...`,
                    messageType: "progress",
                  })}\n\n`,
                ),
              )
            } else if (step === Math.floor((steps * 2) / 3)) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    type: "agent_message",
                    agent: { type: agentType, name: agentName },
                    content: `${agentName}正在处理核心逻辑... (${Math.round(progress)}%)`,
                    messageType: "progress",
                  })}\n\n`,
                ),
              )
            }

            // Simulate processing delay
            await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200))
          }

          // Stream the result content progressively
          const resultContent = generateAgentResult(agentType)
          const chunks = splitIntoChunks(resultContent, 50) // Split into ~50 char chunks

          for (const chunk of chunks) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "agent_content_chunk",
                  agent: { type: agentType, name: agentName },
                  chunk: chunk,
                  isComplete: false,
                })}\n\n`,
              ),
            )

            await new Promise((resolve) => setTimeout(resolve, 50 + Math.random() * 100))
          }

          // Mark agent as complete
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "agent_complete",
                agent: { type: agentType, name: agentName },
                content: resultContent,
              })}\n\n`,
            ),
          )

          // Small delay between agents
          await new Promise((resolve) => setTimeout(resolve, 500))
        }

        // Send workflow completion
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "workflow_complete",
            })}\n\n`,
          ),
        )
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              message: "Stream processing failed",
            })}\n\n`,
          ),
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}

function determineRequiredAgents(message: string): string[] {
  const lowerMessage = message.toLowerCase()
  const agents: string[] = ["scheduler"]

  if (lowerMessage.includes("scrna") || lowerMessage.includes("单细胞") || lowerMessage.includes("rna测序")) {
    agents.push("scrna")
  }
  if (lowerMessage.includes("知识") || lowerMessage.includes("文献") || lowerMessage.includes("提取")) {
    agents.push("knowledge")
  }
  if (lowerMessage.includes("过滤") || lowerMessage.includes("筛选") || lowerMessage.includes("质控")) {
    agents.push("filter")
  }

  agents.push("summary")
  return agents
}

function getAgentName(type: string): string {
  const names = {
    scheduler: "调度Agent",
    knowledge: "知识提取Agent",
    scrna: "scRNA数据处理Agent",
    filter: "数据过滤Agent",
    summary: "总结Agent",
  }
  return names[type as keyof typeof names] || "Agent"
}

function splitIntoChunks(text: string, chunkSize: number): string[] {
  const chunks: string[] = []
  let currentChunk = ""
  const words = text.split(" ")

  for (const word of words) {
    if (currentChunk.length + word.length + 1 <= chunkSize) {
      currentChunk += (currentChunk ? " " : "") + word
    } else {
      if (currentChunk) chunks.push(currentChunk)
      currentChunk = word
    }
  }

  if (currentChunk) chunks.push(currentChunk)
  return chunks
}

function generateAgentResult(agentType: string): string {
  const results = {
    scheduler: `## 任务调度完成

我已经分析了您的请求，并制定了以下处理计划：

1. **数据预处理** - 检查数据格式和完整性
2. **质量控制** - 应用标准QC流程
3. **分析处理** - 执行核心分析算法
4. **结果整理** - 生成可视化报告

正在启动后续Agent执行具体任务...`,

    knowledge: `## 知识提取结果

从相关文献和数据库中提取到以下关键信息：

### 相关研究
- **Cell Types**: 识别出15种主要细胞类型
- **Marker Genes**: 发现32个关键标记基因
- **Pathways**: 涉及3条重要信号通路

### 参考文献
1. Nature Methods (2023) - Single-cell RNA sequencing best practices
2. Cell (2022) - Advanced clustering algorithms for scRNA-seq
3. Genome Biology (2023) - Quality control in single-cell analysis

数据已整理完成，可用于后续分析。`,

    scrna: `## scRNA数据处理完成

### 数据概览
- **细胞数量**: 8,547个细胞
- **基因数量**: 23,156个基因
- **质控后细胞**: 7,892个细胞 (92.3%)

### 处理步骤
1. ✅ 数据加载和格式验证
2. ✅ 质量控制指标计算
3. ✅ 细胞和基因过滤
4. ✅ 标准化和缩放
5. ✅ 主成分分析 (PCA)
6. ✅ 聚类分析

### 主要发现
- 识别出**12个细胞群**
- 发现**156个差异表达基因**
- 细胞类型注释准确率: **94.2%**`,

    filter: `## 数据过滤结果

### 过滤统计
- **原始细胞数**: 8,547
- **过滤后细胞数**: 7,892 (保留92.3%)
- **原始基因数**: 23,156  
- **过滤后基因数**: 18,234 (保留78.7%)

### 过滤标准
- **细胞过滤**: 
  - 基因数 > 200 且 < 6000
  - 线粒体基因比例 < 20%
  - 核糖体基因比例 < 50%

- **基因过滤**:
  - 至少在3个细胞中表达
  - 平均表达量 > 0.01

### 质量提升
- 降噪效果: **85.3%**
- 信号纯度: **91.7%**`,

    summary: `## 分析总结报告

### 🎯 核心发现
本次scRNA-seq分析成功处理了8,547个细胞的转录组数据，经过严格的质量控制和数据过滤，最终获得了7,892个高质量细胞的分析结果。

### 📊 关键指标
- **细胞群数量**: 12个不同的细胞群
- **标记基因**: 156个显著差异表达基因
- **细胞类型**: 成功注释15种主要细胞类型
- **数据质量**: 整体质量评分92.3%

### 🔬 生物学意义
1. **细胞异质性**: 发现了预期的细胞类型多样性
2. **功能通路**: 识别出3条关键的信号传导通路
3. **疾病关联**: 部分基因与已知疾病标记物高度相关

### 📈 建议后续分析
- 轨迹分析 (Trajectory Analysis)
- 细胞通讯分析 (Cell Communication)
- 功能富集分析 (GO/KEGG Enrichment)

分析完成！数据已准备就绪，可进行进一步的深入研究。`,
  }

  return results[agentType as keyof typeof results] || "处理完成"
}
