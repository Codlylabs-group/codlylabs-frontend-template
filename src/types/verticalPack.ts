export interface VerticalPackTimelineItem {
  phase: string
  focus: string
  deliverables: string[]
}

export interface VerticalConnector {
  name: string
  system: string
  status: 'ready' | 'mapping' | 'testing'
}

export interface VerticalPackSummary {
  vertical: string
  pocTemplates: number
  curatedCases: number
  complianceModules: string[]
}
