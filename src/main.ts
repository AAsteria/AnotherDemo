interface UploadItem {
  name: string;
  type: string;
  pages: number;
  size: string;
  status: 'pending' | 'uploaded';
}

type Page =
  | 'landing'
  | 'upload'
  | 'questionnaire'
  | 'tasks'
  | 'learning'
  | 'practice'
  | 'review'
  | 'mock'
  | 'complete';

type ModePreference = '知识获取 + 备考' | '快速应试';

type TaskKind = 'learn' | 'practice' | 'review' | 'mock';

type TaskStatus = 'locked' | 'available' | 'complete';

interface TaskNode {
  id: string;
  title: string;
  difficulty: '易' | '中' | '难';
  eta: number;
  type: TaskKind;
  status: TaskStatus;
  xp: number;
  summary: string;
}

interface Toast {
  message: string;
  tone: 'success' | 'info';
}

interface QuestionnaireState {
  deadline: string;
  dailyHours: number;
  examDuration: number;
  isSchoolCourse: boolean;
  mode: ModePreference;
  aiPrediction: boolean;
}

class OrangeSprintDemo {
  private currentPage: Page = 'landing';
  private uploadItems: UploadItem[] = [];
  private tasks: TaskNode[] = [];
  private root: HTMLElement;
  private sidebar: HTMLElement;
  private toastArea: HTMLElement;
  private questionnaire: QuestionnaireState = {
    deadline: '',
    dailyHours: 3,
    examDuration: 120,
    isSchoolCourse: true,
    mode: '知识获取 + 备考',
    aiPrediction: true,
  };
  private countdownTarget: Date | null = null;
  private mockTimer: number | null = null;

  constructor(rootId: string) {
    const rootEl = document.getElementById(rootId);
    const sidebarEl = document.getElementById('chat-panel');
    const toastEl = document.getElementById('toast-area');
    if (!rootEl || !sidebarEl || !toastEl) {
      throw new Error('Missing required containers');
    }
    this.root = rootEl;
    this.sidebar = sidebarEl;
    this.toastArea = toastEl;

    this.seedData();
    this.bindGlobalNav();
    this.render();
  }

  private seedData() {
    this.uploadItems = [
      { name: 'Lecture slides W1-10.pdf', type: '讲义 PDF', pages: 120, size: '18MB', status: 'pending' },
      { name: 'Linear Algebra Textbook Ch.5-7', type: '教材章节', pages: 200, size: '22MB', status: 'pending' },
      { name: '期末 coverage note.png', type: '重点/大纲', pages: 1, size: '0.5MB', status: 'pending' },
      { name: 'Past assignments.zip', type: 'past assignments', pages: 45, size: '12MB', status: 'pending' },
      { name: 'Past midterms (no answers).pdf', type: 'past midterms', pages: 30, size: '7MB', status: 'pending' },
      { name: 'Quizzes set', type: 'quiz', pages: 15, size: '2MB', status: 'pending' },
    ];

    this.tasks = [
      {
        id: 'diag',
        title: '特征值 & 对角化',
        difficulty: '中',
        eta: 25,
        type: 'learn',
        status: 'available',
        xp: 30,
        summary: '最低解题必要知识 + 例题演练',
      },
      {
        id: 'rank-nullity',
        title: '秩-零空间 + 线性相关性',
        difficulty: '中',
        eta: 20,
        type: 'practice',
        status: 'locked',
        xp: 25,
        summary: '典型题 + 常见变式练习，支持拍照批改',
      },
      {
        id: 'orthogonal',
        title: '正交投影 & 最小二乘',
        difficulty: '难',
        eta: 30,
        type: 'learn',
        status: 'locked',
        xp: 30,
        summary: '模板化推导 + 速记要点',
      },
      {
        id: 'review',
        title: '错题本强化',
        difficulty: '易',
        eta: 15,
        type: 'review',
        status: 'locked',
        xp: 15,
        summary: '安排智能复习间隔，批量复刷',
      },
      {
        id: 'mock',
        title: 'Final Mock (倒数第二关)',
        difficulty: '难',
        eta: 60,
        type: 'mock',
        status: 'locked',
        xp: 50,
        summary: '仿真考试 + 小墨逐题批改 + 弱点雷达图',
      },
    ];
  }

  private bindGlobalNav() {
    const logoBtn = document.querySelector('.logo-area');
    logoBtn?.addEventListener('click', () => this.navigate('landing'));
    const quickButtons = document.querySelectorAll('.nav-shortcut');
    quickButtons.forEach((btn) => {
      btn.addEventListener('click', () => this.navigate((btn as HTMLElement).dataset.target as Page));
    });
  }

  private navigate(page: Page) {
    this.currentPage = page;
    this.render();
  }

  private render() {
    switch (this.currentPage) {
      case 'landing':
        this.renderLanding();
        break;
      case 'upload':
        this.renderUpload();
        break;
      case 'questionnaire':
        this.renderQuestionnaire();
        break;
      case 'tasks':
        this.renderTaskTree();
        break;
      case 'learning':
        this.renderLearning();
        break;
      case 'practice':
        this.renderPractice();
        break;
      case 'review':
        this.renderReview();
        break;
      case 'mock':
        this.renderMock();
        break;
      case 'complete':
        this.renderCompletion();
        break;
    }
  }

  private renderLanding() {
    this.root.innerHTML = `
      <section class="hero">
        <div class="hero-text">
          <p class="eyebrow">橙知 · 考前 3 天冲刺</p>
          <h1>72 小时速成：线性代数 Second-year 期末应试路径</h1>
          <p class="sub">聚焦“最低解题必要知识”，上传资料后 30 秒生成个性化任务树，伴随拍照批改与模拟考。</p>
          <div class="cta-group">
            <button class="btn primary" id="start-btn">开始冲刺（只需 72 小时）</button>
            <button class="btn ghost" id="view-flow">查看流程图</button>
          </div>
          <div class="microcopy">今日建议：优先完成“特征值与对角化”模板，目标 25 分钟。</div>
        </div>
        <div class="hero-card">
          <div class="mascot">
            <div class="mascot-face">🍊</div>
            <p>橙子小助理：我会根据你的上传资料生成考点树，并在关键节点提醒。</p>
          </div>
          <div class="progress-mini">
            <div>
              <p class="label">距离考试</p>
              <p class="strong">3 天 0 小时</p>
            </div>
            <div>
              <p class="label">目标分数</p>
              <p class="strong">70 - 80 分</p>
            </div>
            <div>
              <p class="label">当前状态</p>
              <p class="strong">未上传资料</p>
            </div>
          </div>
        </div>
      </section>
    `;

    const startBtn = document.getElementById('start-btn');
    startBtn?.addEventListener('click', () => this.navigate('upload'));
    const viewFlow = document.getElementById('view-flow');
    viewFlow?.addEventListener('click', () => this.showToast('点击任务节点可进入学习/练习/模拟考', 'info'));
  }

  private renderUpload() {
    const uploadedCount = this.uploadItems.filter((i) => i.status === 'uploaded').length;
    const total = this.uploadItems.length;
    const progress = Math.round((uploadedCount / total) * 100);

    this.root.innerHTML = `
      <section class="panel">
        <header class="panel-head">
          <div>
            <p class="eyebrow">资料上传</p>
            <h2>整理你的资料，生成个性化任务树</h2>
            <p class="sub">讲义 PDF、教材章节、期末重点、往年试题都可以批量拖拽上传。</p>
          </div>
          <button class="btn primary" id="upload-all">模拟上传</button>
        </header>
        <div class="upload-body">
          <div class="dropzone" id="dropzone">
            <p>拖拽文件到此，或点击模拟上传</p>
            <p class="hint">支持：PDF / 图片 / ZIP；自动识别类型</p>
            <div class="mascot-bubble">这些资料会帮助我们为你生成个性化任务树</div>
          </div>
          <div class="file-list">
            <div class="progress-line">
              <span>已上传 ${uploadedCount} / ${total} 项</span>
              <div class="bar"><div class="bar-fill" style="width:${progress}%"></div></div>
            </div>
            ${this.uploadItems
              .map(
                (item) => `
                  <div class="file-card ${item.status}">
                    <div>
                      <p class="title">${item.name}</p>
                      <p class="meta">${item.type} · ${item.pages} 页 · ${item.size}</p>
                    </div>
                    <div class="tag">${item.status === 'uploaded' ? '已上传' : '待上传'}</div>
                  </div>
                `
              )
              .join('')}
          </div>
        </div>
        <footer class="panel-foot">
          <button class="btn ghost" id="back-home">返回首页</button>
          <button class="btn primary" id="next-config" ${uploadedCount < total ? 'disabled' : ''}>下一步（开始配置）</button>
        </footer>
      </section>
    `;

    document.getElementById('back-home')?.addEventListener('click', () => this.navigate('landing'));
    document.getElementById('upload-all')?.addEventListener('click', () => this.simulateUpload());
    document.getElementById('next-config')?.addEventListener('click', () => this.navigate('questionnaire'));
  }

  private simulateUpload() {
    let index = 0;
    const timer = setInterval(() => {
      if (index >= this.uploadItems.length) {
        clearInterval(timer);
        this.showToast('资料已上传，正在生成个性化任务树…', 'info');
        this.render();
        return;
      }
      this.uploadItems[index].status = 'uploaded';
      index += 1;
      this.render();
    }, 400);
  }

  private renderQuestionnaire() {
    this.root.innerHTML = `
      <section class="panel overlay">
        <div class="overlay-card">
          <h2>预冲刺配置</h2>
          <p class="sub">根据你的时间和目标，系统将调整任务树的节点数量与优先级。</p>
          <form id="q-form" class="form-grid">
            <label>预计完成冲刺日期时间
              <input type="datetime-local" name="deadline" value="${this.defaultDeadline()}">
            </label>
            <label>每天可学习时长（小时）
              <input type="range" name="daily" min="1" max="8" step="0.5" value="${this.questionnaire.dailyHours}"/>
              <span class="value" id="daily-value">${this.questionnaire.dailyHours} h</span>
            </label>
            <label>考试时长（分钟）
              <input type="number" name="duration" value="${this.questionnaire.examDuration}" min="30" max="240"/>
            </label>
            <label class="switch-row">是否为特定学校课程
              <input type="checkbox" name="school" ${this.questionnaire.isSchoolCourse ? 'checked' : ''}/>
              <span class="switch"></span>
            </label>
            <label>偏好模式
              <select name="mode">
                <option value="知识获取 + 备考" ${this.questionnaire.mode === '知识获取 + 备考' ? 'selected' : ''}>知识获取 + 备考</option>
                <option value="快速应试" ${this.questionnaire.mode === '快速应试' ? 'selected' : ''}>快速应试</option>
              </select>
            </label>
            <label class="switch-row">是否包含 AI 押题
              <input type="checkbox" name="predict" ${this.questionnaire.aiPrediction ? 'checked' : ''}/>
              <span class="switch"></span>
            </label>
            <p class="warning" id="warning"></p>
            <div class="form-actions">
              <button type="button" class="btn ghost" id="cancel-q">取消</button>
              <button type="submit" class="btn primary" id="generate">生成任务树（系统思考）</button>
            </div>
          </form>
          <div class="loading" id="loading" hidden>
            <div class="dots">
              <span></span><span></span><span></span>
            </div>
            <p>系统思考中… 正在为你布局 3 天冲刺路径</p>
          </div>
        </div>
      </section>
    `;

    const form = document.getElementById('q-form') as HTMLFormElement;
    const warning = document.getElementById('warning') as HTMLElement;
    const dailyRange = form.querySelector('input[name="daily"]') as HTMLInputElement;
    const dailyValue = document.getElementById('daily-value') as HTMLElement;
    dailyRange.addEventListener('input', () => {
      dailyValue.textContent = `${dailyRange.value} h`;
      const hours = parseFloat(dailyRange.value);
      warning.textContent = hours < 3 ? '建议至少每天 3 小时以完成关键节点' : '';
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      this.questionnaire = {
        deadline: (data.get('deadline') as string) || this.defaultDeadline(),
        dailyHours: parseFloat(data.get('daily') as string),
        examDuration: parseInt(data.get('duration') as string, 10),
        isSchoolCourse: !!data.get('school'),
        mode: data.get('mode') as ModePreference,
        aiPrediction: !!data.get('predict'),
      };
      this.showLoading();
    });

    document.getElementById('cancel-q')?.addEventListener('click', () => this.navigate('upload'));
  }

  private defaultDeadline() {
    const now = new Date();
    now.setDate(now.getDate() + 3);
    now.setHours(21, 0, 0, 0);
    return now.toISOString().slice(0, 16);
  }

  private showLoading() {
    const loading = document.getElementById('loading');
    loading?.removeAttribute('hidden');
    setTimeout(() => {
      this.countdownTarget = new Date(this.questionnaire.deadline || this.defaultDeadline());
      this.tasks.forEach((task) => (task.status = task.id === 'diag' ? 'available' : 'locked'));
      this.showToast('生成完成：个性化任务树已准备好', 'success');
      this.navigate('tasks');
    }, 1200);
  }

  private renderTaskTree() {
    const completed = this.tasks.filter((t) => t.status === 'complete').length;
    const progress = Math.round((completed / this.tasks.length) * 100);
    this.root.innerHTML = `
      <section class="panel">
        <header class="panel-head">
          <div>
            <p class="eyebrow">个性化任务树</p>
            <h2>围绕“考什么 & 必须掌握”自动生成节点</h2>
            <p class="sub">点击节点立即进入模板化学习 / 练习 / 模拟考，完成后将激励加 XP。</p>
          </div>
          <div class="countdown" id="countdown"></div>
        </header>
        <div class="progress-line">
          <span>整体完成率 ${progress}%</span>
          <div class="bar"><div class="bar-fill" style="width:${progress}%"></div></div>
        </div>
        <div class="task-grid">
          ${this.tasks
            .map(
              (task) => `
                <article class="task-card ${task.status} ${task.type}" data-id="${task.id}">
                  <div class="task-top">
                    <span class="pill ${task.difficulty}">${task.difficulty}</span>
                    <span class="pill timing">${task.eta} 分钟</span>
                  </div>
                  <h3>${task.title}</h3>
                  <p class="meta">${task.summary}</p>
                  <div class="status-row">
                    <span class="ring ${task.status}"></span>
                    <span>${task.status === 'complete' ? '已完成 + XP' : task.status === 'available' ? '可开始' : '待解锁'}</span>
                  </div>
                  <button class="btn small ${task.status === 'locked' ? 'disabled' : 'primary'}" ${task.status === 'locked' ? 'disabled' : ''}>
                    ${task.type === 'learn' ? '进入学习节点' : task.type === 'practice' ? '开始练习/批改' : task.type === 'mock' ? '进入模拟考' : '查看错题本'}
                  </button>
                </article>
              `
            )
            .join('')}
        </div>
        <footer class="panel-foot">
          <p class="microcopy">完成节点时，节点闪烁 → 橙色打勾，顶部进度条增长并显示微奖励（+XP）。</p>
          <button class="btn ghost" id="to-complete">跳转到完成页（演示）</button>
        </footer>
      </section>
    `;

    this.bindCountdown();
    document.querySelectorAll('.task-card').forEach((card) => {
      card.addEventListener('click', (event) => {
        const target = event.currentTarget as HTMLElement;
        const taskId = target.dataset.id;
        const task = this.tasks.find((t) => t.id === taskId);
        if (!task || task.status === 'locked') return;
        if (task.type === 'learn') this.navigate('learning');
        if (task.type === 'practice') this.navigate('practice');
        if (task.type === 'review') this.navigate('review');
        if (task.type === 'mock') this.navigate('mock');
      });
    });

    document.getElementById('to-complete')?.addEventListener('click', () => this.navigate('complete'));
  }

  private bindCountdown() {
    const el = document.getElementById('countdown');
    if (!el || !this.countdownTarget) return;
    const update = () => {
      const now = new Date();
      const diff = this.countdownTarget!.getTime() - now.getTime();
      if (diff <= 0) {
        el.textContent = '距考试 0 天 0 小时';
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      el.textContent = `距考试 ${days} 天 ${hours} 小时`;
    };
    update();
    setInterval(update, 1000 * 60 * 5);
  }

  private renderLearning() {
    this.root.innerHTML = `
      <section class="two-col">
        <div class="content">
          <p class="eyebrow">学习节点 · 应试教学</p>
          <h2>特征值与对角化：最低解题必要知识</h2>
          <p class="sub">模板化步骤，立即可做题。选中段落右击，呼出应试快捷问答。</p>
          <div class="example">
            <div class="question">
              <h4>示例题（接近考试风格）</h4>
              <p>给定矩阵 A = [[2,1,0],[0,2,0],[0,0,3]]，判断 A 是否可对角化，并给出步骤。</p>
              <ol>
                <li>特征多项式 det(A-λI) = (2-λ)^2 (3-λ)</li>
                <li>特征值 λ1=2（代数重数 2），λ2=3（代数重数 1）</li>
                <li>求解 (A-2I)x=0，特征向量维度 = 2 → 代数重数=几何重数 → 可对角化</li>
              </ol>
              <div class="toolbar">
                <button class="pill-btn">Highlight</button>
                <button class="pill-btn">笔记</button>
                <button class="pill-btn">标记疑难</button>
              </div>
            </div>
            <div class="template">
              <h4>3 步模板（判断矩阵能否对角化）</h4>
              <ol>
                <li>计算特征值 det(A − λI)</li>
                <li>处理重复 λ（代数重数 vs. 几何重数）</li>
                <li>行化简检验特征向量维度</li>
              </ol>
              <p class="hint">提示：若每个特征值的几何重数 = 代数重数，总维数 = n，则 A 可对角化。</p>
            </div>
          </div>
          <div class="actions">
            <button class="btn ghost" id="back-tree">返回任务树</button>
            <button class="btn primary" id="complete-node">完成并标记</button>
          </div>
        </div>
        <aside class="sidebar">
          <h4>快捷问答（右击触发）</h4>
          <ul class="menu">
            <li>这和考试有什么关系？</li>
            <li>举个简单例题</li>
            <li>我看不懂</li>
            <li>常见错误</li>
          </ul>
          <div class="chat-panel">
            <div class="msg from-ai">
              <p class="label">橙子小助理</p>
              <p>本节得分点：确认重复特征值的几何重数；构造对角化 P 时注意特征向量线性无关性。</p>
            </div>
            <div class="msg from-ai subtle">
              <p class="label">小墨提示</p>
              <p>完成并标记后，自动推送 2 道变式题 + 1 次拍照批改。</p>
            </div>
          </div>
        </aside>
      </section>
    `;
    document.getElementById('back-tree')?.addEventListener('click', () => this.navigate('tasks'));
    document.getElementById('complete-node')?.addEventListener('click', () => {
      this.markTaskComplete('diag');
      this.unlockNext('rank-nullity');
      this.showToast('已掌握：特征值与对角化（+1）', 'success');
      this.navigate('tasks');
    });
  }

  private renderPractice() {
    this.root.innerHTML = `
      <section class="two-col">
        <div class="content">
          <p class="eyebrow">练习节点 · 在线答题 / 拍照批改</p>
          <h2>秩-零空间 + 线性相关性</h2>
          <p class="sub">选择在线答题或上传手写作业，小墨实时批改，错题加入错题本。</p>
          <div class="question-card">
            <h4>典型题</h4>
            <p>给定矩阵 B = [[1,2,3],[2,4,6],[1,1,1]]，判断行向量是否线性相关，并给出秩与零空间维度。</p>
            <div class="answer-area">
              <label>你的答案（要点式）</label>
              <textarea id="practice-answer" placeholder="写出行化简步骤 + 秩 + 零空间维度"></textarea>
              <div class="upload-inline">
                <button class="btn ghost" id="upload-photo">拍照上传手写答案</button>
                <span class="hint">上传后小墨自动批改</span>
              </div>
              <button class="btn primary" id="submit-practice">提交批改</button>
            </div>
          </div>
          <div class="result" id="practice-result" hidden></div>
          <div class="actions">
            <button class="btn ghost" id="back-tree-2">返回任务树</button>
            <button class="btn primary" id="complete-practice">标记完成</button>
          </div>
        </div>
        <aside class="sidebar">
          <h4>小墨批改 · 即时反馈</h4>
          <p class="hint">做对：短暂激励 “Nice！进步啦 🍊”；做错：引导“别急，我们来拆解错误点 →”。</p>
          <div class="faq">
            <p class="label">常见易错</p>
            <ul>
              <li>行化简未保持主元列对应</li>
              <li>将代数重数误判为秩</li>
              <li>零空间基未覆盖所有自由变量</li>
            </ul>
          </div>
        </aside>
      </section>
    `;

    document.getElementById('back-tree-2')?.addEventListener('click', () => this.navigate('tasks'));
    document.getElementById('upload-photo')?.addEventListener('click', () => this.showToast('已模拟上传，等待小墨批改…', 'info'));
    document.getElementById('submit-practice')?.addEventListener('click', () => this.gradePractice());
    document.getElementById('complete-practice')?.addEventListener('click', () => {
      this.markTaskComplete('rank-nullity');
      this.unlockNext('orthogonal');
      this.showToast('Nice！进步啦 🍊', 'success');
      this.navigate('tasks');
    });
  }

  private gradePractice() {
    const result = document.getElementById('practice-result') as HTMLElement;
    result.innerHTML = `
      <div class="badge success">小墨批改完成：正确 ✅</div>
      <p>参考解答（要点）：</p>
      <ol>
        <li>行化简 → 主元列 1、2，第三列为自由列 → 秩 r=2</li>
        <li>零空间维度 = 列数 3 - 秩 2 = 1，基向量可取 (-2,1,0)</li>
        <li>行向量线性相关（因为秩 < 行数）</li>
      </ol>
      <p class="hint">考查知识点：秩-零空间定理、线性相关性判定。常见错误：忽略自由变量，导致零空间维度错误。</p>
    `;
    result.removeAttribute('hidden');
    this.showToast('批改完成，已加入错题本（若错误）', 'info');
  }

  private renderReview() {
    this.root.innerHTML = `
      <section class="panel">
        <p class="eyebrow">错题本与复习计划</p>
        <h2>优先攻克高频错因，安排智能复习间隔</h2>
        <div class="review-grid">
          <div class="mistake-card">
            <h4>题目：特征值重根判别</h4>
            <p>错因：忽略几何重数 < 代数重数。</p>
            <p class="label">纠正步骤：</p>
            <ul>
              <li>重算 (A-λI) 的秩，确认自由变量个数。</li>
              <li>若特征向量不足，补充 Jordan 块提示。</li>
            </ul>
            <div class="tag-row"><span class="pill">高优先级</span><span class="pill">线性代数</span></div>
          </div>
          <div class="mistake-card">
            <h4>题目：最小二乘法</h4>
            <p>错因：未写出正规方程。</p>
            <p class="label">纠正步骤：</p>
            <ul>
              <li>写出 A^T A x = A^T b，检查 A^T A 可逆。</li>
              <li>若不可逆，使用 QR 分解。</li>
            </ul>
            <div class="tag-row"><span class="pill">中优先级</span><span class="pill">正交投影</span></div>
          </div>
        </div>
        <div class="scheduler">
          <h4>安排复刷</h4>
          <div class="slots">
            <button class="pill-btn">今晚 20:00 · 25 分钟</button>
            <button class="pill-btn">明天 09:00 · 20 分钟</button>
            <button class="pill-btn">考试前 2 小时 · 速记</button>
          </div>
          <button class="btn primary" id="schedule">加入计划</button>
        </div>
        <div class="actions">
          <button class="btn ghost" id="back-tree-3">返回任务树</button>
          <button class="btn primary" id="complete-review">完成复盘</button>
        </div>
      </section>
    `;

    document.getElementById('back-tree-3')?.addEventListener('click', () => this.navigate('tasks'));
    document.getElementById('schedule')?.addEventListener('click', () => this.showToast('已安排复刷：今晚 20:00', 'success'));
    document.getElementById('complete-review')?.addEventListener('click', () => {
      this.markTaskComplete('review');
      this.unlockNext('mock');
      this.navigate('tasks');
    });
  }

  private renderMock() {
    this.root.innerHTML = `
      <section class="panel">
        <p class="eyebrow">模拟考 · 倒数第二关</p>
        <h2>60 分钟仿真考试，提交后小墨逐题批改 + 弱点雷达图</h2>
        <div class="mock-top">
          <div class="timer" id="mock-timer">60:00</div>
          <button class="btn ghost" id="start-mock">开始计时</button>
        </div>
        <div class="mock-body">
          <ol>
            <li>题 1：判断矩阵是否可逆，并给出逆矩阵或说明不存在的理由。</li>
            <li>题 2：对角化或 Jordan 分解（根据题目可行性选择）。</li>
            <li>题 3：最小二乘拟合与误差分析。</li>
            <li>题 4：线性相关性与秩-零空间定理综合题。</li>
          </ol>
        </div>
        <div class="actions">
          <button class="btn ghost" id="back-tree-4">返回任务树</button>
          <button class="btn primary" id="submit-mock">提交并批改</button>
        </div>
        <div class="result" id="mock-result" hidden></div>
      </section>
    `;

    document.getElementById('back-tree-4')?.addEventListener('click', () => this.navigate('tasks'));
    document.getElementById('start-mock')?.addEventListener('click', () => this.startMockTimer());
    document.getElementById('submit-mock')?.addEventListener('click', () => this.finishMock());
  }

  private startMockTimer() {
    const timerEl = document.getElementById('mock-timer');
    if (!timerEl) return;
    let remaining = 60 * 60; // seconds
    if (this.mockTimer) clearInterval(this.mockTimer);
    this.mockTimer = window.setInterval(() => {
      remaining -= 1;
      const min = Math.floor(remaining / 60)
        .toString()
        .padStart(2, '0');
      const sec = (remaining % 60).toString().padStart(2, '0');
      timerEl.textContent = `${min}:${sec}`;
      if (remaining <= 0 && this.mockTimer) {
        clearInterval(this.mockTimer);
        this.finishMock();
      }
    }, 1000);
    this.showToast('计时已开始，保持节奏～', 'info');
  }

  private finishMock() {
    if (this.mockTimer) clearInterval(this.mockTimer);
    this.markTaskComplete('mock');
    this.root.querySelectorAll('.mock-body li').forEach((li) => li.classList.add('completed'));
    const result = document.getElementById('mock-result') as HTMLElement;
    result.innerHTML = `
      <div class="badge success">批改完成</div>
      <p>总分：78 / 100 · 预测区间 74-82</p>
      <p>弱点：特征值重根、最小二乘细节。建议复习错题本 + 速记模板。</p>
      <div class="radar">雷达图（示意）：{代数基础 80, 对角化 70, 正交投影 65, 计算稳健 85}</div>
      <button class="btn primary" id="go-complete">查看复盘 & 庆祝</button>
    `;
    result.removeAttribute('hidden');
    document.getElementById('go-complete')?.addEventListener('click', () => this.navigate('complete'));
    this.showToast('模拟考完成，已生成弱点雷达图', 'success');
  }

  private renderCompletion() {
    this.root.innerHTML = `
      <section class="panel celebration">
        <div class="confetti">🎉</div>
        <p class="eyebrow">冲刺完成</p>
        <h2>恭喜完成 3 天冲刺！</h2>
        <p class="sub">预测分数区间：74 - 82 分。关键弱点：特征值重根、最小二乘细节。</p>
        <div class="summary">
          <div>
            <p class="label">完成节点</p>
            <p class="strong">${this.tasks.filter((t) => t.status === 'complete').length} / ${this.tasks.length}</p>
          </div>
          <div>
            <p class="label">累计 XP</p>
            <p class="strong">${this.tasks.filter((t) => t.status === 'complete').reduce((acc, t) => acc + t.xp, 0)} XP</p>
          </div>
          <div>
            <p class="label">下一步</p>
            <p class="strong">复习错题本 + 导出考前小抄</p>
          </div>
        </div>
        <div class="actions">
          <button class="btn primary" id="review-wrong">复习错题本</button>
          <button class="btn ghost" id="export-cheatsheet">导出考前小抄</button>
        </div>
        <div class="mascot">橙子小助理：稳住节奏，考前再做一次速记。</div>
      </section>
    `;

    document.getElementById('review-wrong')?.addEventListener('click', () => this.navigate('review'));
    document.getElementById('export-cheatsheet')?.addEventListener('click', () => this.showToast('已准备 PDF 小抄（示意）', 'info'));
  }

  private markTaskComplete(id: string) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return;
    task.status = 'complete';
  }

  private unlockNext(id: string) {
    const next = this.tasks.find((t) => t.id === id);
    if (!next) return;
    next.status = 'available';
  }

  private showToast(message: string, tone: 'success' | 'info') {
    const toast: Toast = { message, tone };
    const el = document.createElement('div');
    el.className = `toast ${toast.tone}`;
    el.textContent = toast.message;
    this.toastArea.appendChild(el);
    setTimeout(() => el.classList.add('show'), 50);
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 300);
    }, 2500);
  }
}

const bootstrap = () => new OrangeSprintDemo('app');

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootstrap, { once: true });
} else {
  bootstrap();
}
