type DemoLocale = "zh-CN" | "en-US";

const messages = {
  "zh-CN": {
    title: "运营控制台",
    eyebrow: "本地演示页面",
    nav: {
      overview: "概览",
      workspace: "工作区",
      activity: "动态"
    },
    workspace: "团队空间",
    views: {
      home: "总览面板",
      delivery: "交付进度",
      reports: "经营报表"
    },
    statsTitle: "关键指标",
    quickStats: [
      { label: "活跃项目", value: "18", meta: "本周新增 3 个" },
      { label: "待处理事项", value: "42", meta: "8 个高优先级" },
      { label: "发布成功率", value: "99.1%", meta: "过去 30 天" }
    ],
    heroEyebrow: "业务总览",
    heroTitle: "这是一个普通的可测试业务界面",
    heroCopy:
      "它提供导航、侧栏、卡片、按钮、列表和双栏布局，方便你用扩展在任意真实页面上验证 hover、select、move、resize 与 intent 输出。",
    primaryAction: "创建任务",
    secondaryAction: "导出报表",
    cards: [
      {
        title: "订单概览",
        description: "展示本周成交、退款和待发货数据，适合测试卡片、标题、数值块和按钮区域。",
        tag: "数据卡"
      },
      {
        title: "交付看板",
        description: "展示任务状态和进度，适合测试列表项、标签和多层嵌套容器。",
        tag: "列表区"
      },
      {
        title: "告警中心",
        description: "展示异常提醒、操作按钮和说明文案，适合测试右侧信息区域。",
        tag: "侧面板"
      }
    ],
    viewLabel: "查看",
    pipelineEyebrow: "交付节奏",
    pipelineTitle: "本周推进计划",
    exportPlan: "导出计划",
    timeline: [
      {
        title: "需求确认",
        description: "整理设计变更、验收标准和风险点，确保开发排期可执行。"
      },
      {
        title: "界面联调",
        description: "同步页面状态、接口占位和布局细节，减少提测前返工。"
      },
      {
        title: "上线检查",
        description: "确认监控、回滚策略和关键路径，保证发布窗口稳定。"
      }
    ],
    activityEyebrow: "最近动态",
    activityTitle: "团队日志",
    refresh: "刷新",
    activityFeed: [
      "华东区域周报已同步到共享盘",
      "设计评审在今天 15:00 完成",
      "结算中心新接口进入灰度验证"
    ]
  },
  "en-US": {
    title: "Operations Console",
    eyebrow: "Local Demo Page",
    nav: {
      overview: "Overview",
      workspace: "Workspace",
      activity: "Activity"
    },
    workspace: "Team Space",
    views: {
      home: "Overview Board",
      delivery: "Delivery Progress",
      reports: "Business Reports"
    },
    statsTitle: "Key Metrics",
    quickStats: [
      { label: "Active projects", value: "18", meta: "+3 this week" },
      { label: "Open tasks", value: "42", meta: "8 high priority" },
      { label: "Release success", value: "99.1%", meta: "Last 30 days" }
    ],
    heroEyebrow: "Business overview",
    heroTitle: "This is a normal testable business UI",
    heroCopy:
      "It includes navigation, sidebar, cards, buttons, lists, and a two-column layout so the extension can be verified on a realistic interface.",
    primaryAction: "Create Task",
    secondaryAction: "Export Report",
    cards: [
      {
        title: "Order Summary",
        description: "Shows weekly orders, refunds, and pending shipments for testing card and metric layouts.",
        tag: "Data Card"
      },
      {
        title: "Delivery Board",
        description: "Shows task status and progress for testing lists, tags, and nested containers.",
        tag: "List Area"
      },
      {
        title: "Alert Center",
        description: "Shows warnings, buttons, and descriptive copy for testing the right-side panel.",
        tag: "Side Panel"
      }
    ],
    viewLabel: "View",
    pipelineEyebrow: "Delivery cadence",
    pipelineTitle: "Plan for this week",
    exportPlan: "Export Plan",
    timeline: [
      {
        title: "Requirement review",
        description: "Confirm design changes, acceptance criteria, and risks before scheduling work."
      },
      {
        title: "UI integration",
        description: "Align page states, mocked APIs, and layout details before QA."
      },
      {
        title: "Release check",
        description: "Verify monitoring, rollback strategy, and critical paths before launch."
      }
    ],
    activityEyebrow: "Recent activity",
    activityTitle: "Team Log",
    refresh: "Refresh",
    activityFeed: [
      "East region weekly report synced to shared storage",
      "Design review finished today at 3:00 PM",
      "Settlement service API moved into gradual rollout"
    ]
  }
} as const;

function getDemoLocale(): DemoLocale {
  return navigator.language.toLowerCase().startsWith("zh") ? "zh-CN" : "en-US";
}

function App(): JSX.Element {
  const locale = getDemoLocale();
  const copy = messages[locale];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">
          <span className="brand-mark__core" />
          <span className="brand-mark__pulse" />
        </div>
        <div className="topbar__title-group">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
        </div>
        <nav className="topbar__nav" aria-label={locale === "zh-CN" ? "主导航" : "Primary navigation"}>
          <a href="#overview">{copy.nav.overview}</a>
          <a href="#workspace">{copy.nav.workspace}</a>
          <a href="#activity">{copy.nav.activity}</a>
        </nav>
      </header>

      <div className="layout">
        <aside className="sidebar" aria-label={locale === "zh-CN" ? "页面导航" : "Page navigation"}>
          <section className="sidebar__section" id="workspace">
            <p className="sidebar__label">{copy.workspace}</p>
            <button className="sidebar__item sidebar__item--active" type="button">
              {copy.views.home}
            </button>
            <button className="sidebar__item" type="button">
              {copy.views.delivery}
            </button>
            <button className="sidebar__item" type="button">
              {copy.views.reports}
            </button>
          </section>

          <section className="sidebar__section">
            <p className="sidebar__label">{copy.statsTitle}</p>
            <div className="stats-list">
              {copy.quickStats.map((stat) => (
                <article className="stat-card" key={stat.label}>
                  <p>{stat.label}</p>
                  <strong>{stat.value}</strong>
                  <span>{stat.meta}</span>
                </article>
              ))}
            </div>
          </section>
        </aside>

        <main className="content">
          <section className="hero-panel" id="overview">
            <div>
              <p className="eyebrow">{copy.heroEyebrow}</p>
              <h2>{copy.heroTitle}</h2>
              <p className="hero-panel__copy">{copy.heroCopy}</p>
            </div>
            <div className="hero-panel__actions">
              <button className="primary-button" type="button">
                {copy.primaryAction}
              </button>
              <button className="secondary-button" type="button">
                {copy.secondaryAction}
              </button>
            </div>
          </section>

          <section className="cards-grid">
            {copy.cards.map((card) => (
              <article className="feature-card" key={card.title}>
                <div className="feature-card__header">
                  <span className="feature-card__tag">{card.tag}</span>
                  <button className="ghost-button" type="button" aria-label={`${copy.viewLabel} ${card.title}`}>
                    {copy.viewLabel}
                  </button>
                </div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </section>

          <section className="content-grid">
            <article className="detail-panel">
              <div className="detail-panel__header">
                <div>
                  <p className="eyebrow">{copy.pipelineEyebrow}</p>
                  <h3>{copy.pipelineTitle}</h3>
                </div>
                <button className="secondary-button" type="button">
                  {copy.exportPlan}
                </button>
              </div>
              <div className="timeline">
                {copy.timeline.map((item, index) => (
                  <div className="timeline__item" key={item.title}>
                    <span className="timeline__index">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="activity-panel" id="activity">
              <div className="detail-panel__header">
                <div>
                  <p className="eyebrow">{copy.activityEyebrow}</p>
                  <h3>{copy.activityTitle}</h3>
                </div>
                <button className="ghost-button" type="button">
                  {copy.refresh}
                </button>
              </div>
              <ul className="activity-list">
                {copy.activityFeed.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
