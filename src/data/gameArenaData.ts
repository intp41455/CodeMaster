/**
 * 闯关竞技场题库
 * ------------------------------------------------------------
 * 题库与课程体系解耦：题目只依赖通用编程知识，
 * 由 GameQuizArena 组件负责计时、连击、生命值与结算。
 */

export type GameDifficulty = "简单" | "中等" | "挑战";

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizQuestion {
  id: string;
  track: string;
  difficulty: GameDifficulty;
  question: string;
  codeSnippet?: string;
  options: QuizOption[];
  /** 答对后的趣味知识补充，用于强化记忆 */
  funFact?: string;
}

export interface CodePuzzle {
  id: string;
  title: string;
  language: string;
  goal: string;
  /** 正确的行顺序，同时作为标准答案 */
  correctOrder: string[];
  hint: string;
  explanation: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q-var-reference",
    track: "Python 核心基石",
    difficulty: "中等",
    question: "下面这段代码会输出什么？",
    codeSnippet: "a = [1, 2, 3]\nb = a\nb.append(4)\nprint(len(a))",
    options: [
      {
        id: "a",
        text: "3",
        isCorrect: false,
        explanation:
          "这是最容易踩的坑。b = a 并没有复制一份列表，而是让 a 和 b 指向内存中的同一个列表对象。",
      },
      {
        id: "b",
        text: "4",
        isCorrect: true,
        explanation:
          "正确。b 与 a 指向同一个列表对象，通过 b 修改列表，a 看到的自然也是修改后的结果，因此长度为 4。",
      },
      {
        id: "c",
        text: "报错",
        isCorrect: false,
        explanation: "语法完全合法，不会报错。问题出在语义理解，而不是语法。",
      },
      {
        id: "d",
        text: "1",
        isCorrect: false,
        explanation: "len(a) 返回的是列表元素个数，不是变量个数。",
      },
    ],
    funFact:
      "如果需要真正独立的副本，要用 b = a.copy() 或 b = a[:]。理解「变量是标签，不是盒子」是跨过新手墙的关键一步。",
  },
  {
    id: "q-loop-range",
    track: "零基础极速启蒙",
    difficulty: "简单",
    question: "range(3) 会生成哪些数字？",
    codeSnippet: 'for i in range(3):\n    print(i, end=" ")',
    options: [
      {
        id: "a",
        text: "1 2 3",
        isCorrect: false,
        explanation: "range 从 0 开始计数，这是编程世界里最常见的约定。",
      },
      {
        id: "b",
        text: "0 1 2",
        isCorrect: true,
        explanation: "正确。range(3) 生成 0、1、2，左闭右开：包含起点，不包含终点。",
      },
      {
        id: "c",
        text: "0 1 2 3",
        isCorrect: false,
        explanation: "终点 3 不包含在内。记住口诀：含头不含尾。",
      },
      {
        id: "d",
        text: "3 2 1",
        isCorrect: false,
        explanation: "那是 range(3, 0, -1) 的效果，需要显式指定步长为负。",
      },
    ],
    funFact: "左闭右开可以优雅表达「前 n 个」，所以 range(n) 就是前 n 个数字。",
  },
  {
    id: "q-list-search",
    track: "数据结构与算法思维",
    difficulty: "中等",
    question: "在 Python 列表 lst 中判断 x in lst，平均时间复杂度是多少？",
    options: [
      {
        id: "a",
        text: "O(1)",
        isCorrect: false,
        explanation: "O(1) 是集合与字典的查找效率，列表没有哈希结构，做不到常数时间。",
      },
      {
        id: "b",
        text: "O(log n)",
        isCorrect: false,
        explanation: "二分查找才是 O(log n)，但前提是数据有序，且列表本身不做自动排序。",
      },
      {
        id: "c",
        text: "O(n)",
        isCorrect: true,
        explanation:
          "正确。列表查找只能从头到尾逐个比对，最坏要看完整个列表，因此是线性复杂度。",
      },
      {
        id: "d",
        text: "O(n log n)",
        isCorrect: false,
        explanation: "O(n log n) 通常出现在排序算法中，与查找无关。",
      },
    ],
    funFact:
      "如果一个列表要被反复查找，把它换成 set 往往能把整体性能从 O(n²) 降到 O(n)——这是实战中最常见的优化之一。",
  },
  {
    id: "q-sql-having",
    track: "SQL 与现代数据持久化",
    difficulty: "中等",
    question: "SQL 中 WHERE 与 HAVING 的核心区别是什么？",
    options: [
      {
        id: "a",
        text: "WHERE 在分组前过滤行，HAVING 在分组后过滤组",
        isCorrect: true,
        explanation:
          "正确。WHERE 作用于原始行，因此不能使用聚合函数；HAVING 作用于分组结果，可以使用 COUNT、SUM 等聚合值。",
      },
      {
        id: "b",
        text: "两者完全没有区别，可以随意替换",
        isCorrect: false,
        explanation:
          "如果真没区别，数据库就不会保留两个关键字了。它们在执行顺序上处于不同阶段。",
      },
      {
        id: "c",
        text: "HAVING 只能用于 ORDER BY 之后",
        isCorrect: false,
        explanation: "HAVING 属于分组过滤阶段，与排序是两回事。",
      },
      {
        id: "d",
        text: "WHERE 只能用于单表，HAVING 只能用于多表",
        isCorrect: false,
        explanation: "这个说法与表数量无关，是常见误解。",
      },
    ],
    funFact:
      "SQL 的逻辑执行顺序是：FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT。理解了顺序，绝大多数 SQL 报错都能自己定位。",
  },
  {
    id: "q-mutable-default",
    track: "Python 核心基石",
    difficulty: "挑战",
    question: "这段代码两次调用会输出什么？",
    codeSnippet:
      'def add(item, box=[]):\n    box.append(item)\n    return box\n\nprint(add(1))\nprint(add(2))',
    options: [
      {
        id: "a",
        text: "[1] 和 [2]",
        isCorrect: false,
        explanation:
          "这是直觉答案，但 Python 的默认参数只会在函数定义时求值一次，而不是每次调用都重建。",
      },
      {
        id: "b",
        text: "[1] 和 [1, 2]",
        isCorrect: true,
        explanation:
          "正确。默认值 [] 在函数定义时就创建了一个列表对象，并被后续所有调用共享，所以第二次调用是在同一个列表上追加。",
      },
      {
        id: "c",
        text: "报错",
        isCorrect: false,
        explanation: "语法和运行都正常，这是一个静默的语义陷阱，正因如此才危险。",
      },
      {
        id: "d",
        text: "None 和 None",
        isCorrect: false,
        explanation: "函数有明确的 return 语句，不会返回 None。",
      },
    ],
    funFact:
      "正确写法是 box=None，再在函数体内 if box is None: box = []。可变默认参数是 Python 最经典的面试陷阱之一。",
  },
  {
    id: "q-float-precision",
    track: "零基础极速启蒙",
    difficulty: "中等",
    question: "print(0.1 + 0.2 == 0.3) 的结果是什么？",
    options: [
      {
        id: "a",
        text: "True",
        isCorrect: false,
        explanation:
          "数学上成立，但计算机用二进制浮点数表示小数，0.1 和 0.2 都无法被精确表示。",
      },
      {
        id: "b",
        text: "False",
        isCorrect: true,
        explanation:
          "正确。0.1 + 0.2 实际得到 0.30000000000000004，与 0.3 并不严格相等。",
      },
      {
        id: "c",
        text: "报错",
        isCorrect: false,
        explanation: "这是完全合法的表达式，不会报错。",
      },
      {
        id: "d",
        text: "None",
        isCorrect: false,
        explanation: "比较运算返回布尔值，不会是 None。",
      },
    ],
    funFact:
      "涉及金额计算时务必用 Decimal 或整数分单位存储。浮点误差在金融场景会直接变成账目对不上。",
  },
  {
    id: "q-linux-port",
    track: "Linux 现代操作系统与服务运维",
    difficulty: "简单",
    question: "生产服务器上要查清 8080 端口被哪个进程占用，最直接的做法是？",
    options: [
      {
        id: "a",
        text: "lsof -i :8080",
        isCorrect: true,
        explanation:
          "正确。lsof -i :端口 能直接列出占用该端口的进程与 PID，配合 ps 即可定位并处理。",
      },
      {
        id: "b",
        text: "ls -l /port/8080",
        isCorrect: false,
        explanation: "Linux 中端口不是文件路径，这个路径不存在。",
      },
      {
        id: "c",
        text: "cat /proc/port",
        isCorrect: false,
        explanation: "/proc 下没有名为 port 的条目，端口信息不在这里。",
      },
      {
        id: "d",
        text: "重启服务器",
        isCorrect: false,
        explanation: "重启会掩盖问题而不是解决问题，生产环境更不能这么干。",
      },
    ],
    funFact:
      "netstat -tlnp 与 ss -tlnp 也能做到这件事，ss 在新系统上更快。定位到 PID 后，cat /proc/<PID>/cmdline 可确认是哪个服务。",
  },
  {
    id: "q-async-block",
    track: "FastAPI 现代异步接口架构",
    difficulty: "挑战",
    question:
      "在 FastAPI 的 async def 路由函数里直接调用同步阻塞的 requests.get()，会发生什么？",
    options: [
      {
        id: "a",
        text: "只影响当前这一个请求",
        isCorrect: false,
        explanation:
          "这正是它危险的地方：影响范围远超你的预期，是典型的隐性生产事故。",
      },
      {
        id: "b",
        text: "阻塞事件循环，拖慢同一进程内所有并发请求",
        isCorrect: true,
        explanation:
          "正确。事件循环是单线程的，同步阻塞调用会卡住整个循环，其他已在等待的请求全部被堵住，吞吐量断崖式下跌。",
      },
      {
        id: "c",
        text: "自动切换到线程池，没有任何影响",
        isCorrect: false,
        explanation: "线程池只对 def 定义的同步路由生效，async def 里的阻塞调用不会被自动接管。",
      },
      {
        id: "d",
        text: "直接抛出异常",
        isCorrect: false,
        explanation: "它不会报错，只会安静地把性能拖垮——这才是最可怕的一类缺陷。",
      },
    ],
    funFact:
      "正确做法是改用 httpx.AsyncClient，或者把同步调用放进 run_in_executor。这是掌控力实训里的经典案例。",
  },
  {
    id: "q-react-loop",
    track: "智能体与多智能体系统全景进阶",
    difficulty: "中等",
    question: "智能体的 ReAct 循环由哪三个核心步骤组成？",
    options: [
      {
        id: "a",
        text: "输入 → 输出 → 反馈",
        isCorrect: false,
        explanation: "这是笼统的数据流描述，没有体现智能体「先思考、再行动」的关键机制。",
      },
      {
        id: "b",
        text: "Thought → Action → Observation",
        isCorrect: true,
        explanation:
          "正确。先推理出当前该做什么，再调用工具行动，然后观察工具返回的结果，据此进入下一轮推理。",
      },
      {
        id: "c",
        text: "训练 → 推理 → 部署",
        isCorrect: false,
        explanation: "这是机器学习工程流程，与智能体的运行时循环不是一回事。",
      },
      {
        id: "d",
        text: "提问 → 检索 → 排序",
        isCorrect: false,
        explanation: "这是 RAG 的检索流程，只覆盖了智能体能力中的一小块。",
      },
    ],
    funFact:
      "ReAct 的关键价值在于让模型把「想」和「做」分离，从而可以借助外部工具突破自身知识边界。",
  },
  {
    id: "q-ts-unknown",
    track: "TypeScript 现代全栈类型工程",
    difficulty: "中等",
    question: "TypeScript 中 any 与 unknown 的关键区别是什么？",
    options: [
      {
        id: "a",
        text: "unknown 更安全：使用前必须先做类型收窄",
        isCorrect: true,
        explanation:
          "正确。unknown 表示「我还不知道它是什么类型」，因此不能直接调用方法，必须先判断类型；any 则完全放弃类型检查。",
      },
      {
        id: "b",
        text: "两者完全等价，只是写法不同",
        isCorrect: false,
        explanation: "如果等价，TypeScript 就没必要引入 unknown 了。",
      },
      {
        id: "c",
        text: "any 只能用于函数参数，unknown 只能用于返回值",
        isCorrect: false,
        explanation: "两者都可以出现在任何需要类型标注的位置。",
      },
      {
        id: "d",
        text: "unknown 是运行时的类型，any 是编译期的类型",
        isCorrect: false,
        explanation: "TypeScript 的类型都只存在于编译期，运行时会全部擦除。",
      },
    ],
    funFact:
      "接第三方数据时用 unknown 再配类型守卫，可以把「运行时白屏」变成「编译期报错」，这是类型系统最大的价值。",
  },
  {
    id: "q-git-reset-soft",
    track: "Linux 现代操作系统与服务运维",
    difficulty: "中等",
    question: "git reset --soft HEAD~1 的作用是什么？",
    options: [
      {
        id: "a",
        text: "撤销最近一次提交，但保留改动在暂存区",
        isCorrect: true,
        explanation:
          "正确。--soft 只移动分支指针，不改动暂存区和工作区，所以你可以重新组织这次提交。",
      },
      {
        id: "b",
        text: "彻底删除最近一次提交和它的所有改动",
        isCorrect: false,
        explanation: "那是 --hard 的行为，会造成改动丢失，属于危险操作。",
      },
      {
        id: "c",
        text: "把最近一次提交推送到远端",
        isCorrect: false,
        explanation: "推送要用 git push，reset 只作用于本地历史。",
      },
      {
        id: "d",
        text: "创建一个新的分支",
        isCorrect: false,
        explanation: "创建分支要用 git branch 或 git switch -c。",
      },
    ],
    funFact:
      "三种模式记法：--soft 只动指针，--mixed（默认）连暂存区一起回退，--hard 连工作区一起清空。",
  },
  {
    id: "q-is-equals",
    track: "Python 核心基石",
    difficulty: "简单",
    question: "Python 中 is 与 == 的区别是什么？",
    options: [
      {
        id: "a",
        text: "is 比较对象身份（是否为同一对象），== 比较值是否相等",
        isCorrect: true,
        explanation:
          "正确。is 判断两个名字是否指向同一块内存，== 则调用对象的相等性逻辑比较内容。",
      },
      {
        id: "b",
        text: "两者完全一样",
        isCorrect: false,
        explanation:
          "对小的整数和短字符串，两者结果常常相同，这掩盖了差异，但本质上完全不同。",
      },
      {
        id: "c",
        text: "is 只能比较数字，== 只能比较字符串",
        isCorrect: false,
        explanation: "两者都不限类型，区别在于比较的维度不同。",
      },
      {
        id: "d",
        text: "== 的性能一定比 is 差",
        isCorrect: false,
        explanation: "性能不是重点，语义正确才是。用错语义会写出难以排查的缺陷。",
      },
    ],
    funFact:
      "判断是否为 None 时应该用 is None，而不是 == None，这是 Python 社区的通用约定。",
  },
  {
    id: "q-http-401-403",
    track: "Spring Boot 3 企业级微服务",
    difficulty: "中等",
    question: "HTTP 状态码 401 与 403 的区别是什么？",
    options: [
      {
        id: "a",
        text: "401 表示未认证，403 表示已认证但没有权限",
        isCorrect: true,
        explanation:
          "正确。401 是「你是谁？请先证明身份」，403 是「我知道你是谁，但你不能访问这里」。",
      },
      {
        id: "b",
        text: "401 是服务器错误，403 是客户端错误",
        isCorrect: false,
        explanation: "两者都是 4xx，同属客户端错误范畴。",
      },
      {
        id: "c",
        text: "两者可以随意互换使用",
        isCorrect: false,
        explanation:
          "混用会让前端无法区分「该跳登录页」还是「该提示无权限」，是接口设计的常见瑕疵。",
      },
      {
        id: "d",
        text: "403 表示资源不存在",
        isCorrect: false,
        explanation: "资源不存在是 404，语义完全不同。",
      },
    ],
    funFact:
      "部分系统出于安全考虑，对无权限资源也返回 404，避免攻击者通过状态码探测资源是否存在。",
  },
  {
    id: "q-index-like",
    track: "SQL 与现代数据持久化",
    difficulty: "挑战",
    question: "给 users.email 建了索引后，下面哪种查询通常无法利用这个索引？",
    options: [
      {
        id: "a",
        text: "WHERE email = 'a@b.com'",
        isCorrect: false,
        explanation: "等值查询是索引最擅长处理的情况，效率极高。",
      },
      {
        id: "b",
        text: "WHERE email LIKE '%@gmail.com'",
        isCorrect: true,
        explanation:
          "正确。模式以通配符开头，数据库无法通过索引的有序结构定位起点，只能逐行扫描。",
      },
      {
        id: "c",
        text: "WHERE email LIKE 'a%'",
        isCorrect: false,
        explanation: "前缀匹配可以正常走索引，因为起点是确定的。",
      },
      {
        id: "d",
        text: "WHERE email > 'a' ORDER BY email",
        isCorrect: false,
        explanation: "范围查询与排序都能受益于 B+ 树索引的有序性。",
      },
    ],
    funFact:
      "如果确实需要后缀匹配，可以考虑反向存储字段，或使用全文索引与搜索引擎。",
  },
  {
    id: "q-scope-trap",
    track: "Python 核心基石",
    difficulty: "挑战",
    question: "下面这段代码会输出什么？",
    codeSnippet: 'x = 10\ndef f():\n    print(x)\n    x = 20\nf()',
    options: [
      {
        id: "a",
        text: "10",
        isCorrect: false,
        explanation:
          "直觉上会认为读取的是外层的 x，但函数体内存在对 x 的赋值，彻底改变了这个结论。",
      },
      {
        id: "b",
        text: "UnboundLocalError",
        isCorrect: true,
        explanation:
          "正确。函数体内只要有对 x 的赋值，x 在整个函数作用域内都被视为局部变量，print 时它尚未被赋值，因此报错。",
      },
      {
        id: "c",
        text: "20",
        isCorrect: false,
        explanation: "print 在赋值之前执行，不可能读到 20。",
      },
      {
        id: "d",
        text: "None",
        isCorrect: false,
        explanation: "变量未绑定会直接报错，而不是返回 None。",
      },
    ],
    funFact:
      "这个现象叫「局部变量遮蔽」。想在函数内修改全局变量，需要显式声明 global，但更好的做法是改为参数传递。",
  },
  {
    id: "q-idempotent",
    track: "Spring Boot 3 企业级微服务",
    difficulty: "简单",
    question: "接口的「幂等性」指的是什么？",
    options: [
      {
        id: "a",
        text: "同一请求执行一次与执行多次，对系统状态的影响相同",
        isCorrect: true,
        explanation:
          "正确。这是分布式系统里最基础也最重要的约束之一，直接决定重试机制是否安全。",
      },
      {
        id: "b",
        text: "接口响应速度保持稳定",
        isCorrect: false,
        explanation: "那是性能特征，与幂等性无关。",
      },
      {
        id: "c",
        text: "接口必须返回 JSON 格式",
        isCorrect: false,
        explanation: "数据格式与语义约束是两回事。",
      },
      {
        id: "d",
        text: "接口只能被调用一次",
        isCorrect: false,
        explanation:
          "恰恰相反，幂等的意义就在于允许被重复调用而不产生副作用。",
      },
    ],
    funFact:
      "支付、下单这类接口必须做幂等，通常靠唯一请求号加去重表实现。没有幂等设计，网络重试就可能变成重复扣款。",
  },
  {
    id: "q-cache-avalanche",
    track: "Spring Boot 3 企业级微服务",
    difficulty: "中等",
    question: "缓存雪崩指的是什么？",
    options: [
      {
        id: "a",
        text: "大量缓存键在同一时间集中失效，请求瞬间全部压到数据库",
        isCorrect: true,
        explanation:
          "正确。数据库在毫无准备的情况下承接全量流量，很容易直接被压垮，进而引发整条链路不可用。",
      },
      {
        id: "b",
        text: "某个热点键失效导致大量请求打到数据库",
        isCorrect: false,
        explanation: "这是缓存击穿，影响范围集中在一个热点键上。",
      },
      {
        id: "c",
        text: "查询不存在的数据导致每次都穿透到数据库",
        isCorrect: false,
        explanation: "这是缓存穿透，防御手段是空值缓存与布隆过滤器。",
      },
      {
        id: "d",
        text: "缓存服务器磁盘写满",
        isCorrect: false,
        explanation: "这是容量问题，与雪崩的失效时机无关。",
      },
    ],
    funFact:
      "常见对策是给过期时间加随机抖动，避免同一时刻集体失效，再配合多级缓存与熔断降级。",
  },
  {
    id: "q-set-lookup",
    track: "数据结构与算法思维",
    difficulty: "简单",
    question: "Python 中判断某元素是否在 set 里，平均时间复杂度是多少？",
    options: [
      {
        id: "a",
        text: "O(1)",
        isCorrect: true,
        explanation:
          "正确。set 基于哈希表实现，用哈希值直接定位，平均情况下只需常数时间。",
      },
      {
        id: "b",
        text: "O(n)",
        isCorrect: false,
        explanation: "那是列表的做法，需要逐个比对。",
      },
      {
        id: "c",
        text: "O(log n)",
        isCorrect: false,
        explanation: "需要有序结构的二分查找才是 O(log n)。",
      },
      {
        id: "d",
        text: "O(n²)",
        isCorrect: false,
        explanation: "嵌套循环才会出现平方级复杂度。",
      },
    ],
    funFact:
      "日志去重、权限判定这类高频查找场景，优先用 set 或 dict，一个数据结构的选择就能带来数量级的性能差异。",
  },
];

export const CODE_PUZZLES: CodePuzzle[] = [
  {
    id: "pz-swap",
    title: "交换两个变量的值",
    language: "python",
    goal: "把 a 与 b 的值互换，最后打印「2 1」",
    correctOrder: [
      "a = 1",
      "b = 2",
      "temp = a",
      "a = b",
      "b = temp",
      'print(a, "和", b)',
    ],
    hint: "直接把 a = b 会让 a 的原值丢失，需要一个临时容器先把它存起来。",
    explanation:
      "交换的本质是「借用临时变量」。如果少了 temp = a 这一步，a 的原始值会被 b 覆盖，最终两个变量都变成同一个值。",
  },
  {
    id: "pz-average",
    title: "计算列表平均值",
    language: "python",
    goal: "算出列表元素的平均值并打印",
    correctOrder: [
      "nums = [10, 20, 30]",
      "total = sum(nums)",
      "count = len(nums)",
      "average = total / count",
      "print(average)",
    ],
    hint: "先求和，再统计个数，最后相除。",
    explanation:
      "求和与计数必须都完成后再做除法，否则会用到未定义或错误的变量。这也是最典型的「顺序决定正确性」的例子。",
  },
  {
    id: "pz-function",
    title: "定义并调用函数",
    language: "python",
    goal: "定义一个打招呼函数，调用它并打印结果",
    correctOrder: [
      "def greet(name):",
      '    message = "你好, " + name',
      "    return message",
      'print(greet("CodeMaster"))',
    ],
    hint: "函数必须先定义，然后才能调用。return 写在函数体内部并缩进。",
    explanation:
      "注意两点：一是必须先定义后调用，二是函数体需要缩进。少了缩进，函数体就变成了顶层语句，逻辑完全跑偏。",
  },
  {
    id: "pz-file",
    title: "安全地读取文件",
    language: "python",
    goal: "打开文件读取全部内容并统计行数",
    correctOrder: [
      'with open("data.txt", "r", encoding="utf-8") as f:',
      "    content = f.read()",
      "    lines = content.splitlines()",
      "print(len(lines))",
    ],
    hint: "用 with 管理文件句柄，读取与统计在缩进块内完成。",
    explanation:
      "with 会自动关闭文件，即使中途抛异常也不会泄漏句柄。显式指定 encoding 则能避免中文在部分系统上乱码。",
  },
  {
    id: "pz-class",
    title: "定义一个类并创建实例",
    language: "python",
    goal: "定义学生类，创建实例并打印它的名字",
    correctOrder: [
      "class Student:",
      "    def __init__(self, name):",
      "        self.name = name",
      's = Student("小明")',
      "print(s.name)",
    ],
    hint: "__init__ 是初始化方法，self 代表实例自己。",
    explanation:
      "类的定义与使用在顺序和缩进上都有严格要求：__init__ 属于类，方法体再缩进一层，而实例化要写在类定义之外。",
  },
  {
    id: "pz-try",
    title: "用异常处理兜住除零错误",
    language: "python",
    goal: "捕获除零异常并友好提示，程序不崩溃",
    correctOrder: [
      "try:",
      "    result = 10 / 0",
      "except ZeroDivisionError:",
      '    print("除数不能为零")',
      'print("程序继续运行")',
    ],
    hint: "可能出错的语句放进 try，处理逻辑放进 except。",
    explanation:
      "try 里只放可能出错的代码，except 负责兜底。最后的打印放在外面，证明异常已经被处理，程序得以继续执行。",
  },
];
