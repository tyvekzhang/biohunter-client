"use client"

import { Card } from "@/components/ui/card"
import { useIsEnglish } from "@/hooks/use-is-english"
import { Microscope, ShieldCheck, Target } from "lucide-react"

interface QuickStartTemplatesProps {
  onTemplateSelect: (template: string) => void
}

const templates = [
  {
    icon: Target,
    title: "CAR-T靶点挖掘",
    titleEn: "CAR-T Target Discovery",
    description: "挖掘三阴性乳腺癌的CAR-T靶点",
    descriptionEn: "Discover CAR-T targets for triple-negative breast cancer",
    template:
      "我需要挖掘三阴性乳腺癌的CAR-T靶点，请帮我分析相关的单细胞数据，识别肿瘤特异性表面抗原，评估靶点的安全性和有效性。",
    templateEn:
      "I need to discover CAR-T targets for triple-negative breast cancer. Please help me analyze relevant single-cell data, identify tumor-specific surface antigens, and evaluate target safety and efficacy.",
    color: "text-red-600/50",
    bgColor: "bg-red-50/30 dark:bg-red-950/20",
  },
  {
    icon: ShieldCheck,
    title: "免疫检查点靶点挖掘",
    titleEn: "Immune Checkpoint Target Discovery",
    description: "筛选肿瘤相关的免疫检查点靶点",
    descriptionEn: "Identify tumor-related immune checkpoint targets",
    template:
      "我需要分析肿瘤免疫微环境的单细胞数据，识别潜在的免疫检查点靶点，并评估其治疗潜力和安全性。",
    templateEn:
      "I need to analyze single-cell data of the tumor immune microenvironment, identify potential immune checkpoint targets, and evaluate their therapeutic potential and safety.",
    color: "text-blue-600/50",
    bgColor: "bg-blue-50/30 dark:bg-blue-950/20",
  },
  {
    icon: Microscope,
    title: "ADC靶点挖掘",
    titleEn: "ADC Target Discovery",
    description: "发现适合抗体药物偶联的肿瘤靶点",
    descriptionEn: "Discover tumor targets suitable for antibody-drug conjugates",
    template:
      "我需要分析单细胞和组织数据，寻找肿瘤特异性抗原，用于设计抗体药物偶联（ADC）治疗，并评估其选择性和毒性。",
    templateEn:
      "I need to analyze single-cell and tissue data to find tumor-specific antigens for designing antibody-drug conjugates (ADC) therapy and evaluate their selectivity and toxicity.",
    color: "text-green-600/50",
    bgColor: "bg-green-50/30 dark:bg-green-950/20",
  },
]

export function QuickStartTemplates({ onTemplateSelect }: QuickStartTemplatesProps) {
  const isEnglish = useIsEnglish()

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <p className="text-muted-foreground">
          {isEnglish
            ? "Choose a predefined template to quick start"
            : "选择一个预定义模板以快速开始"}
        </p>
      </div>

      <div className="flex flex-row items-center gap-4">
        {templates.map((t, i) => (
          <Card
            key={i}
            className={`py-6  px-4 cursor-pointer hover:shadow-md transition-all ${t.bgColor} border-2 hover:border-primary/20 max-w-md`}
            onClick={() => onTemplateSelect(isEnglish ? t.templateEn : t.template)}
          >
            <div className="flex items-start gap-4 h-24">
              <t.icon className={`h-8 w-8 mt-1 ${t.color}`} />
              <div className="flex-1">
                <h4 className="font-medium mb-2">
                  {isEnglish ? t.titleEn : t.title}
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {isEnglish ? t.descriptionEn : t.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
