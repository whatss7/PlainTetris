var questions = [
    {
        type: "judge",
        content: "（ ）系统测试通常由用户执行。",        
        answer: false,
        count: 0
    },
    {
        type: "judge",
        content: "（ ）C/S 计算模式目前已经成为企业网的首选应用模式。",
        answer: false,
        count: 0
    },
    {
        type: "judge",
        content: "（ ）数字形式的媒体的主要特征是通过计算机网络将文本、图片等信息用二进制编码来表示。",       
        answer: true,
        count: 0
    },
    {
        type: "judge",
        content: "（ ）CAM 是计算机辅助设计的简称。",    
        answer: false,
        count: 0
    },
    {
        type: "judge",
        content: "（ ）应用层协议不包括：SMTP，SNMP和FTP 。",
        answer: false,
        count: 0
    },
    {
        type: "judge",
        content: "（ ）在规定了输入数据必须遵守的规则的情况下，可以确立一个有效等价类（符合规则）和若干个无效 等价类（从不同角度违反规则）。",
        answer: true,
        count: 0
    },
    {
        type: "judge",
        content: "（ ）等价类划分法是一种重要的，常用的黑盒测试用例设计方法。",
        answer: true,
        count: 0
    },
    {
        type: "judge",
        content: "（ ）在Visual Studio.NET 的Windows Installer 有三种部署项目的模板。",
        answer: false,
        count: 0
    },
    {
        type: "judge",
        content: "（ ）多媒体技术是结合文字、图像、声音、动画等多种媒体的一种文件形式。",
        answer: false,
        count: 0
    },
    {
        type: "judge",
        content: "（ ）管理信息系统的预测功能是对企业生产和经营的各个部门和环节的运行情况加以监测发现问题及时 纠正，以保证系统的正常运行。",
        answer: false,
        count: 0
    },
    {
        type: "judge",
        content: "（ ）模块化会降低系统的开发难度。",    
        answer: true,
        count: 0
    },
    {
        type: "judge",
        content: "（ ）HTML Help Workshop 编译环境中.hhk 文件为编译项目文件。",
        answer: false,
        count: 0
    },
    {
        type: "judge",
        content: "（ ）软件需求分析是软件开发早期的一个重要阶段。",
        answer: true,
        count: 0
    },
    {
        type: "judge",
        content: "（ ）可以将经常执行的操作制作成存储过程，在以后的操作中多次调用，但这样会降低工作效率。",   
        answer: false,
        count: 0
    },
    {
        type: "judge",
        content: "（ ）安装操作系统时，有一些组就已经安装在Builtin 和User 文件夹中了。这些组称为“内置组”。",  
        answer: true,
        count: 0
    },
    {
        type: "judge",
        content: "（ ）FileStream 类支持随机访问文件。", 
        answer: true,
        count: 0
    },
    {
        type: "judge",
        content: "（ ）面向对象程序具有三大主要特征即：封装、抽象、多态。",
        answer: false,
        count: 0
    },
    {
        type: "judge",
        content: "（ ）NET 类库是建立.NET Framework 应用 程序、组件和控件的基础。",
        answer: false,
        count: 0
    },
    {
        type: "judge",
        content: "（ ）BOOT.INI 文件具备隐藏，系统，只读 属性。",
        answer: true,
        count: 0
    },
    {
        type: "judge",
        content: "（ ）CHM 文件格式是一种超文本标识语言。",
        answer: true,
        count: 0
    },
    {
        type: "choice",
        content: "原型法工作步骤中，( )的目的是讨论构造原型的过程；写出一简明的骨架式说明性报告。",
        choices: ['快速分析', '构造原型', '使用并评价原型', '修改和完善原型系统'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "用例分为( )和业务用例。",
        choices: ['系统用例', '测试用例', '对象用例', '时序用例'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "( )是指测试软件系统防止非法入侵的能力。",
        choices: ['功能测试', '健壮性测试', '性能测试', '安全性测试'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "( )也叫联合测试。",
        choices: ['单元测试', '系统测试', '集成测试', '验收测试'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "软件测试贯穿于( )。",
        choices: ['软件测试阶段', '软件定义与开发的整个阶段', '软件设计阶段', '软件需求分析阶段'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "使用( )方式，首先对每个模块进行模块测试，然后将这些模块逐步组装，在组装的过程中边连接边测试 ，最后得到要求的软件系统。",
        choices: ['一次性集成', '增值式集成', '静态集成', '动态集成'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列关于编写功能需求文档建议正确的是( )。",
        choices: ['采用被动语态的表达方式', '避免使用比较性的词汇', '需求陈述应该具有多样性', '多使用模糊的、 主观的术语'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "( )要做的工作是深入描述目标系统的功能和性能等。",
        choices: ['算法分析', '数据分析', '需求分析', '界面分析'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "B/S 结构中网络用户在基于( )的客户机上以网络用户界面（NUI）多对多的方式来访问应用服务器上的资源。",
        choices: ['计算器', '查询分析器', '客户端', '浏览器'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "ADO.NET 的( )对象用来向数据库发出各种SQL 命令。",
        choices: ['Connection ', 'Command ', 'DataAdapter ', 'DataSet'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "一般限制查询字符串的长度在( )个字符之内。",
        choices: ['128 ', '1024 ', '512 ', '255'],       
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "通过IIS 将计算机设置为Web 服务器后，计 算机( )。",
        choices: ['不能执行ASP 程序，也不能执行ASP.NET 程序', '能执行ASP 程序，也能执行ASP.NET 程序', '能执行ASP.NET 程序，不能执行ASP 程序', '能执行ASP 程序，不能执行ASP.NET 程序'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "( )建模技术包括两部分即：对语境建模和对需求建模。",
        choices: ['活动图', '用例图', '协作图', '对象图'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "对( )建模可以找出与工作流相关的重要对象，并将其连接到相应的动作状态和活动状态。",
        choices: ['动作流', '活动状态', '动作状态', '对象流'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "安装SQL Server 2000 时，如果要安装到本 地计算机，应该选择( )。",
        choices: ['Local Computer ', 'Remote Computer', 'Virtual Computer ', 'Sql Computer'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "SQL Server 2000 个人版不支持的操作系统 是( )。",
        choices: ['Windows2000Server ', 'Windows2000Profession', 'Windows98 ', 'WindowsCE'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "frame 表示( )。",
        choices: ['符号', '大小', '秒', '桢'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "复杂指令集计算机用( )表示。",
        choices: ['CISD ', 'CISE ', 'CIST ', 'CISC'],    
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列不属于输入设备的是( ) 。",
        choices: ['键盘', '鼠标', '扫描仪', '打印机'],   
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列( )被称为作计算机的大脑。",        
        choices: ['CPU ', '内存', '主板', '硬盘'],       
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "( )是指每个数码所表示的数值，其等于该数码乘以一个与数码所在位置相关的常数。",
        choices: ['基数', '权数', '位数', '进制'],       
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "按制造技术对计算机进行分类，以下错误的 是( )。",
        choices: ['半导体式', '电子式', '晶体管式', '机械式'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列不属于应用软件的是( )。",
        choices: ['Office 系统', '工业控制软件', '统计软 件包', 'UNIX 系统'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "计算机技术与( )结合构成了计算机网络。",
        choices: ['现代通信技术', '现代制造技术', '人工智能技术', '现代物流技术'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列有关信息基本特征的表述，不正确的是( )。",
        choices: ['特殊性和有限性', '普遍性和无限性', '可传递性、共享性', '载体、方式的可变性'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "( )是数据处理的基本单位，即以字节为单位存储和解释信息。",
        choices: ['bit ', 'byte ', 'word ', 'bite'],     
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "Winsock1.1 库函数包含在( )中。",       
        choices: ['Winsock.sys ', 'Winsock.ini ', 'Winsock.dll ', 'Winsock.bat'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "Socket 可以象( )一样被视为一个应用程序 端和远程服务器端之间数据通道。",
        choices: ['对象', '流', '类', '组件'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下面( )个类属于请求/相应层。",
        choices: ['HttpWebReqeust ', 'Socket', 'TcpListener ', 'UdpClient'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "TCP/IP 传输层分为不同的协议( )。",     
        choices: ['TCP 和UDP ', 'TCP 和IP', 'UDP 和IP ', 'TCP，UDP 和IP'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "SQL Server 使用( )实现客户机和SQL Server 服务器之间的网络数据通信。",
        choices: ['网络库', '字符集', '服务登陆标识', '代码库'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "字符集又称作代码页，他们由( )组成。",  
        choices: ['字符、数字和符号', '字符和数字', '数字和符号', '字符和符号'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "在软件测试技术中，( )又称有效性测试。",
        choices: ['单元测试', '集成测试', '确认测试', '系统测试'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "( )是一种先进先出的线性表。",
        choices: ['线性表', '栈', '队列', '串'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "在SQL 语言中，INSERT 语句用于( )。",   
        choices: ['数据查询', '数据定义', '数据操作', '数据控制'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "TestDirector 是( )公司的测试管理工具。",
        choices: ['Rational ', 'Compureware', 'Mercury Interactive ', 'IBM'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "利用( )可以检验程序是否实现了规格说明中所规定的功能和性能。",
        choices: ['无效等价类', '有效等价类', '局部等价类', '全局等价类'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "( )每个判定的每个条件应取到各种可能的值。",
        choices: ['语句覆盖', '判定覆盖', '条件覆盖', '路径覆盖'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "选用测试工具的时候，应该从以下( )个方面来权衡和选择。①功能②价格③连续性④一致性⑤性能⑥开放性", 
        choices: ['①②③④ ', '①②⑤⑥ ', '③④⑤⑥ ', '①②③⑥'],    
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "性能测试即测试软件处理事务的( )。",    
        choices: ['功能', '完整性', '正确性', '速度'],   
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "白盒测试又称( )。",
        choices: ['功能测试', '结构测试', '人工测试', '自动测试'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "边界值分析法的基本思想是：选取正好等于 、刚刚大于或( )边界的值作为测试数据。",
        choices: ['任意', '远远大于', '远远小于', '刚刚小于'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "决策表中的( )的作用是给出问题规定的可能采取的操作。",
        choices: ['条件桩', '条件项', '动作桩', '动作项'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "我国自行研制开发的高性能通用CPU 芯片—龙芯2 号属于( )位CPU。",
        choices: ['16 ', '32 ', '64 ', '128'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "上报审批的标准草案称为标准的( )。",    
        choices: ['草稿', '审批稿', '审核稿', '报批稿'], 
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "多媒体技术的发展与计算机其他技术的发展 和成熟有着密切的关系，( )的突破打开了多媒体信息进入计算机的大门。",
        choices: ['数据压缩技术', '大规模集成电路制造技术', '多媒体数据存储技术', '多媒体网络通信技术'],      
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列( )不是信息系统的组成部分。",      
        choices: ['输入', '处理', '输出', '执行'],       
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "多媒体技术是一个多学科交汇的技术，下列 不属于多媒体技术涉及的学科的是( )。",
        choices: ['现代生物学技术', '微电子科学', '数字信号处理技术', '人工智能技术'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "信息的生命周期包括要求、( )、服务和退出四个阶段。",
        choices: ['发现', '设计', '获得', '产生'],       
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "关于多媒体技术发展的领域，下列表述不正 确的是( )。",
        choices: ['多媒体通信网络的研究', '智能处理', '形成独立学科', '多媒体标准的规范'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "高速缓冲存储器又称( )。",
        choices: ['RAW ', 'Cache ', 'RAM ', 'ROM'],      
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "合同员工违犯职业纪律，在给其处分时应把 握的原则是( )。",
        choices: ['企业不能做罚款处罚', '严重不遵守企业纪律，即可解除劳动合同', '视情节轻重，可以做出撤职处分', '警告往往效果不大'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "西方发达国家在职业道德建设上积累了很多 经验，下列表述不正确的是( )。",
        choices: ['加强职业道德的立法工作', '注重信用档案体系的建立', '重视员工爱国意识的培养', '严格的岗前和 岗位培训'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "办事公道是指从业人员在进行职业活动时要 做到( )。",
        choices: ['追求真理，坚持原则', '奉献社会，助人为乐', '公私分开，实事求是', '有求必应，服务热情'],    
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "模块的( )必须表达该模块的功能，指明每次调用它时应完成的功能。",
        choices: ['名称', '状态', '逻辑', '接口'],       
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "数据存储管理模式中( )，提供基本的文件处理能力。",
        choices: ['文件管理', '关系数据库管理系统', '面向对象数据库管理系统', '面向过程数据库管理系统'],      
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "一个Html 帮助项目使用一个项目文件和Microsoft HTML Help Workshop 编译创建。项目文件的扩展名是( )。",
        choices: ['.hhw ', '.hws ', '.hhp ', '.hhs'],    
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "HTMLHelp Image Editor 是一个在线( )。",
        choices: ['加密工具', '编程工具', '压缩工具', '图形工具'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "建模分析法主要有两大类：( )和( )。",   
        choices: ['面向开发者分析法，面向用户分析法', '面向用例分析法，面向对象分析法', '结构化分析法，非结构 化分析法', '结构化分析法，面向对象分析法'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "( )是结构化分析法分析模型的核心。",    
        choices: ['数据字典', '实体－关系图', '数据流图', '状态转换图'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "SQL Server2000 可以使用( )创建表。",   
        choices: ['C 语言', 'C#语言', 'Transact-SQL 语言', 'JAVA 语言'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "要定义一个事务，需要使用( )命令。",    
        choices: ['Commit ', 'Begin tran', 'Rollback ', 'Start tran'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "使用( )能够改变ODBC 事务的提交方式。", 
        choices: ['m 函数', 'r 函数', 'p 函数', 't 函数'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "人工提交方式下，应用程序调用( )函数提交或回滚一个事务。",
        choices: ['SQLEndTran ', 'SQLCommitTran', 'SQLRollBackTran ', 'SQLBeginTran'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "如果是创建供多人使用的公用账号，应选择“( )”项。",
        choices: ['密码永久有效', '用户下次登录时须更改密码', '账号暂时禁用', '用户不得更改密码'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "用户账号受到( )的制约。",
        choices: ['所在计算机', '用户名称', '用户密码', '组'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "C#语言是( )公司针对.net 平台才推出来的 一门新语言。",
        choices: ['惠普', '微软', 'SUN ', 'IBM'],        
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "利用匈牙利命名规则，dStuID 代表变量是( )。",
        choices: ['整型', '数据类型', '字符型', '双精度型'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "C#中最简单的数据存储机制为( )。",      
        choices: ['文件', '链表', '数据库', '队列'],     
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "StreamWriter 类可以( )，默认编码格式为UTF-8。",
        choices: ['读取标准文本文件的内容', '往标准文本文件中写入内容', '实现对文件目录的操作', '获取文件和设 置文件的基本信息'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "《中华人民共和国劳动法》( )年颁布。",  
        choices: ['1994 ', '2000 ', '2007 ', '2008'],    
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "法人或其他组织的软件著作权保护期为( )年。",
        choices: ['40 ', '50 ', '60 ', '100'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "UML 是一种( )语言。",
        choices: ['程序设计', '文档', '数据库', '测试'], 
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "( )描述软件构件之间的相互依赖关系，提供系统的物理视图。",
        choices: ['组件图', '协作图', '活动图', '对象图'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "( )中包含了某系统所需的平台的机构人员和授权管理接口。",
        choices: ['TjOutsourcingSDK.dll ', 'Accessibility.dll', 'ServiceProcess.dll ', 'RegularExpressions.dll'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "DLL 是一个可以被多个应用程序同时调用的 可执行( )文件。",
        choices: ['十进制', '二进制', '八进制', '十六进制'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "在.NET Framework 中，组件可以是从实现IComponent 的类中直接或间接( )的类。",
        choices: ['继承', '封装', '派生', '复用'],       
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "在Visual Studio2003 中的.NET 的C#中使用( )实现工具栏的设计。",
        choices: ['ToolStrip 类', 'StatusBar 类', 'ToolBar 类', 'TitleBar 类'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "注册表的英文名称为( )。",
        choices: ['registry ', 'regitry ', 'registy ', 'regisrty'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "在系统实用配置程序的( )选项卡下可以设置一般启动选项。",
        choices: ['一般', '启动', '工具', '服务'],       
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    }
];

Array.prototype.shuffle = function() {
    var array = this;
    var m = array.length,
        t, i;
    while (m) {
        i = Math.floor(Math.random() * m--);
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

var indexes = []
var qi = -1;

function choice(index) {
    var result = false;
    var correct = ""
    if (questions[qi].type == "choice") {
        if (questions[qi].mapping[index] == questions[qi].answer) {
            result = true
        }
        correct = questions[qi].choices[questions[qi].answer];
    } else {
        if (index == 0) result = questions[qi].answer;
        else result = !questions[qi].answer;
        correct = questions[qi].answer ? "正确" : "错误";
    }
    if (result) {
        document.getElementById("result_text").textContent = "答案正确！";
    } else {
        document.getElementById("result_text").textContent = "答案错误！正确答案是：" + correct;
        indexes = indexes.slice(0, 8).concat([qi], indexes.slice(8, 30), [qi], indexes.slice(30));
    }
    document.getElementById("choose_btn1").disabled = true;
    document.getElementById("choose_btn2").disabled = true;
    document.getElementById("choose_btn3").disabled = true;
    document.getElementById("choose_btn4").disabled = true;
    document.getElementById("next_btn").disabled = false;
}

function next() {
    if (indexes.length == 0) {
        document.getElementById("question_text").textContent = "这里会有题目...";
        document.getElementById("question_count_text").textContent = "这是第?次做本题";
        document.getElementById("choose_btn1").value = "这是第一个答案";
        document.getElementById("choose_btn2").value = "这是第二个答案";
        document.getElementById("choose_btn3").value = "这是第三个答案";
        document.getElementById("choose_btn4").value = "这是第四个答案";
        document.getElementById("choose_btn1").disabled = true;
        document.getElementById("choose_btn2").disabled = true;
        document.getElementById("choose_btn3").disabled = true;
        document.getElementById("choose_btn4").disabled = true;
        document.getElementById("next_btn").disabled = true;
        document.getElementById("result_text").textContent = "";
        return;
    }
    document.getElementById("choose_btn1").disabled = false;
    document.getElementById("choose_btn2").disabled = false;
    document.getElementById("choose_btn3").disabled = false;
    document.getElementById("choose_btn4").disabled = false;
    document.getElementById("next_btn").disabled = true;
    document.getElementById("result_text").textContent = "";
    qi = indexes[0];
    indexes = indexes.slice(1);
    var to_learn = 0;
    var to_recap = 0;
    for (var i = 0; i < indexes.length; i++) {
        if (questions[indexes[i]].count == 0) to_learn += 1;
        else to_recap += 1;
    }
    if (questions[qi].count == 0) to_learn += 1;
    else to_recap += 1;
    document.getElementById("status_text").textContent = "待学习：" + to_learn + "/待复习：" + to_recap;
    if (questions[qi].type == "choice") {
        document.getElementById("choose_btn3").hidden = false;
        document.getElementById("choose_btn4").hidden = false;
        questions[qi].mapping.shuffle();
        questions[qi].count += 1;
        document.getElementById("question_count_text").textContent = "这是第" + questions[qi].count + "次做本题";
        document.getElementById("question_text").textContent = questions[qi].content;
        for (var i = 0; i < 4; i++) {
            var no = questions[qi].mapping[i];
            document.getElementById("choose_btn" + (i + 1)).value = questions[qi].choices[no];
        }
    } else {
        document.getElementById("choose_btn3").hidden = true;
        document.getElementById("choose_btn4").hidden = true;
        questions[qi].count += 1;
        document.getElementById("question_count_text").textContent = "这是第" + questions[qi].count + "次做本题";
        document.getElementById("question_text").textContent = questions[qi].content;
        document.getElementById("choose_btn1").value = "正确";
        document.getElementById("choose_btn2").value = "错误";
    }
}

function start() {
    indexes = [];
    for (var i = 0; i < 100; i++) {
        indexes.push(i)
        questions[i].count = 0;
    }
    indexes.shuffle();
    document.getElementById("choose_btn1").disabled = false;
    document.getElementById("choose_btn2").disabled = false;
    document.getElementById("choose_btn3").disabled = false;
    document.getElementById("choose_btn4").disabled = false;
    next();
}

