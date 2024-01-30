var questions = [
    {
        type: "choice",
        content: "1997年IBM公司的“深蓝”超级计算机战胜国际象棋世界冠军卡斯帕罗夫。计算机的这一应用属于（ ）。",
        choices: ['云计算', '物联网', '大数据', '人工智能'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "计算机辅助教学是（ ）。",
        choices: ['CAM', 'CAT', 'CAI', 'CAD'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "在计算机中，汉字编码的国标码最高位为（ ）。",
        choices: ['0', '1', '2', '4'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列不同数制的4个数中，值最大的是（ ）。",
        choices: ['11011010B', '217D', '263Q', 'E6H'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "某汉字的十六进制机内码是EAD7H，那么它的国标码是（ ）H。",
        choices: ['4A37', 'CAB7', '6A57', 'B4A6'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "假设某计算机的字长为8位，则十进制数-58的补码是（ ）B。",
        choices: ['11000101', '00111010', '11110101', '11000110'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "大写字母B和小写字母b的十六进制ASCII码值相差（ ）H。",
        choices: ['10', '15', '30', '20'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "1000个32×32点阵的汉字字模，需要占用的存储空间为（ ）KB。",
        choices: ['32', '64', '125', '1000'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列编码中，可能是某个汉字国标码的是（ ）。",
        choices: ['01010100 00110010', '00010100 10110010', '11010100 00110010', '11010100 10110010'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列关于计算机硬件组成的描述中，错误的是（ ）。",
        choices: ['计算机硬件包括主机与外设', '主机指的就是CPU', '外设通常指外部存储设备和输入/输出设备', '一台计算机中可以有多个处理器，它们都能执行指令'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列设备中，属于输出设备的是（ ）。",
        choices: ['键盘', '扫描仪', '绘图仪', '摄像头'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "主板的核心是（ ）。",
        choices: ['CPU插座', '扩展槽', '芯片组', 'CMOS 芯片'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "Intel酷睿i5、i7系列通常指（ ）。",
        choices: ['存储容量', '运算速度', '显示频率', 'CPU型号'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列度量单位中，可以用来度量CPU时钟频率的是 ）。",
        choices: ['ns', 'MB/s', 'fps', 'GHz'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "微型计算机中，运算器的基本功能是（ ）。",
        choices: ['存储各种数据和程序', '进行算术运算和逻辑运算', '传输各种数据', '对计算机各部件实行控制'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列关于显示器的描述中，错误的是（ ）。",
        choices: ['不同类型的显示器，配置的显卡相同', '显示器的分辨率越高，显示的图像越清晰', '分辨率是显示器的一项重要指标', '显示器是计算机必不可少的输出设备'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "在系统总线中，地址总线的功能是（ ）。",
        choices: ['用于选择外存地址', '用于选择主存单元地址', '用于选择进行信息传输的设备', '用于指定主存和I/O设备接口的地址'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "BIOS 程序中不包括（ ）。",
        choices: ['系统设置程序', '系统启动自检程序', '开机加电自检程序', '操作系统'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列软件中，（ ）是磁盘分区软件。",
        choices: ['WinZip', 'DiskGenius', 'Adobe Audition', 'WinRAR'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列关于软件与程序的区别，描述错误的是（ ）。",
        choices: ['软件是程序及开发、使用和维护所需要的所有文档的总称，而程序是软件的一部分', '程序是软件的一个组成部分，一个已经开发完善的软件会包含许多程序', '程序是用户自己编写的，而软件是由厂家提供的', '程序不一定是软件，而软件包含了很多个程序'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "操作系统的处理机管理功能的主要任务是（ ）。",
        choices: ['对CPU的运行进行有效的控制和管理', '有效地组织、存储和保护文件', '分配内存空间，保证各进程占用的存储空间不冲突', '作业的输入和输出，作业的调度与控制'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "在Windows中查找文件时，可以使用通配符来匹配文件名中不能确定的字符。如果需要查找主文件名长度为5个字符，并且第5个字符为“d”的Excel 2016格式的文件，下列输入的查找条件中，得到的结果最精确的是（ ）。",
        choices: ['*d.xlsx', 'd????.*', '****d.xlsx', '????d.xlsx'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列选项中，（ ）不是引起“软件危机”的主要原因。",
        choices: ['对软件需求分析的重要性认识不够', '软件开发过程难于进行质量管理和进度控制', '随着问题的复杂度增加，人们开发软件的效率下降', '随着社会和生产的开展，软件无法处理海量数据'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "Windows文件及文件夹组织结构是（ ）。",
        choices: ['树形结构', '表格结构', '网络结构', '线性结构'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "在Windows中，用鼠标左键将D盘的文件拖动到桌面的结果是（ ）。",
        choices: ['复制文件', '移动文件', '生成快捷方式', '没有任何内容'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "在Windows中，长日期“59年4月日dddd”中的“dddd”代表的是（ ）。",
        choices: ['年', '月', '日', '星期'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列关于C程序的描述中，正确的是（ ）。",
        choices: ['用C程序实现的算法必须要有输入和输出操作', '用C程序实现的算法可以没有输出但必须要有输入', '用C程序实现的算法可以没有输入但必须要有输出', '用C程序实现的算法可以既没有输入也没有输出'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列关于计算机网络的描述中，错误的是（ ）。",
        choices: ['星型结构的网络是集中式网络', '网状型结构常用于广域网的连接', '环型结构的网络系统中，信息是定向流动的', '星型结构的系统称为多处理中心的集中式网络'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "在OSI/RM参考模型中，对话控制是（ ）层的功能。",
        choices: ['网络', '传输', '会话', '表示'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "网络协议的要素有（ ）。",
        choices: ['数据格式、编码、信号电平', '数据格式、控制信息、速度匹配', '语法、语义、同步', '编码、控制信息、同步'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列关于交换机的描述中，错误的是（ ）。",
        choices: ['低传输延迟', '高传输带宽', '可以根据用户级别设置访问权限', '允许不同传输速率的网卡共存于同一个网络'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "二层交换机工作在OSIURM参考模型的（ ）层。",
        choices: ['传输', '物理', '网络', '数据链路'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "用通信线路把一个公司的所有计算机连接起来所构成的网络是（ ）。",
        choices: ['因特网', '城域网', '局域网', '广域网'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列关于互联网“微博”的描述中，错误的是（ ）。",
        choices: ['是一种 Internet上的信息资源共享服务', '一般用于组织或个人发布公开短信息', '浏览信息的用户可以针对某条信息发表评论', '用户必须安装微博专用的客户端软件才能使用'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "某部门申请到一个C类P地址，若要分成14个子网，其合理的子网掩码地址应为（ ）",
        choices: ['255.255.255.255', '255.255.255.0', '255.255.255.224', '255.255.255.240'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "串行数据通信中，发送方和接收方的时钟是统一的，称为（ ）传输。",
        choices: ['同步', '异步', '单向', '双向'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "在计算机网络中，广域网和局域网的分类依据是（ ）。",
        choices: ['信息交换方式', '网络使用者', '网络覆盖范围', '传输控制方法'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "计算机网络通信的一个显著特点是（ ）。",
        choices: ['稳定性', '间歇性、突发性', '安全性', '易用性'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "两台计算机利用电话线路传输数据信号时，必备的设备是（ ）。",
        choices: ['网卡', '调制解调器', '中继器', '同轴电缆'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "互联网中的所有端系统和路由器都必须实现的协议是（ ）。",
        choices: ['IP', 'ICMP', 'UDP', 'TCP'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列属于自由软件的是（ ）。",
        choices: ['Windows 10', 'Photoshop', 'Office', 'Linux'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "数据在网络中传输时都以流量进行描述，流量分析建立在（ ）的基础上，对截获的数据根据需要进行定向分析。",
        choices: ['数据拦截', '数据加密', '数据解密', '数据压缩'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列属于被动攻击手段的是（ ）。",
        choices: ['IP欺骗', '拒绝服务', '流量分析', '截取并修改正在传输的数据'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "信息系统的物理安全不包括（ ）。",
        choices: ['环境安全', '设施和设备安全', '操作系统安全', '介质安全'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列不属于计算机病毒特点的是（ ）。",
        choices: ['传染性', '寄生性', '隐蔽性', '免疫性'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "视频信息的最小单位是（ ）。",
        choices: ['帧', '位', '比率', '赫兹'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "多媒体计算机是指（ ）。",
        choices: ['能与多种电器连接的计算机', '能处理多种媒体的计算机', '能玩游戏、播放VCD的计算机', '安装有多种媒体播放软件的计算机'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列选项中，不属于音频播放软件的是（ ）。",
        choices: ['GoldWave', 'Windows Media Player', 'ACDSee', 'Sound Forge'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列属于图像压缩标准的是（ ）。",
        choices: ['BMP', 'AVI', 'JPEG', 'MP3'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列不属于图片文件格式的是（ ）。",
        choices: ['PDF', 'BMP', 'GIF', 'JPEG'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "第一代计算机的电子器件是（ ）。",
        choices: ['电子管', '晶体管', '中小规模集成电路', '大规模集成电路'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "地震对人们的生产和生活会产生一定的破坏力。目前，科学家利用计算机在地震预测方面的研究取得了一定进展，相信未来有效地预测地震将成为可能，计算机在地震预测研究中的应用属于（ ）。",
        choices: ['科学计算', '数据处理', '自动控制', '计算机辅助设计'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "-27的补码是（ ）B。",
        choices: ['11100100', '11101101', '11100110', '11100101'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "不同的汉字，下列选项中相同的是（ ）。",
        choices: ['对应的机内码', '32*32点阵形成字形码所占存储空间', '对应的国标码', '对应的区位码'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "八进制数51转换为二进制数是（ ）。",
        choices: ['100001', '100011', '100101', '101001'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "十进制数-105的反码是（ ）B。",
        choices: ['11101001', '10010111', '10010110', '00010111'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "常说的某计算机内存是2GB，就是指它的容量为（ ）字节。",
        choices: ['2×1024×1024×1024', '2×1000×1000×1000', '2×1024×1024', '2×1000×1000'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "与二进制数1111000等值的十进制数是（ ）。",
        choices: ['100', '108', '120', '126'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "在计算机中，数据存储的基本单位是（）。",
        choices: ['字符', '字节', '字长', '二进制位'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列存储器的读写速度由快到慢正确的是（ ）。",
        choices: ['内存>移动硬盘>U盘>Cache>固态硬盘', 'Cache>内存>固态硬盘>移动硬盘>U盘', 'Cache>内存>移动硬盘>软盘>U盘', 'Cache>寄存器>内存>固态硬盘>移动硬盘'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列关于计算机的描述中，正确的是（）。",
        choices: ['计算机的外部设备包括存储器、输入设备、输出设备', 'CPU 可以直接读取RAM中的信息', 'CPU处理信息的结果直接通过显示器显示，供用户直观地看到', 'CMOS具有开机自检功能'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列计算机的性能指标中，决定计算机运算精度的是（）。",
        choices: ['字长', '时钟主频', '存储容量', '运算速度'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列关于微型计算机CPU的描述中，错误的是（ ）。",
        choices: ['CPU由运算器和控制器组成', '计算机的性能主要取决于CPU', 'CPU是计算机硬件的核心部件', 'CPU可以代替存储器'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "硬盘故障可以分为软故障和硬故障两类，下列属于硬故障的是（ ）。",
        choices: ['启动文件丢失', '分区表损坏', '扇区物理性损坏', '主引导记录损坏'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "计算机硬件系统的5大组成部分不包括（ ）。",
        choices: ['存储器', '输入设备', '控制器', '网络设备'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "某计算机的主要技术参数为“i9-13 600/3.0 G/16G/1 T/”，其中16G的含义为（ ）。",
        choices: ['CPU的运算速度为16GMIPS', 'CPU的时钟主频为16 GHz', '计算机的内存容量为16GB', '计算机的硬盘容量为16GB'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "根据“存储程序控制”的原理，计算机各部件如何运作是由（ ）决定的。",
        choices: ['用户', '操作系统', '存储器', 'CPU所执行的指令'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "字长是衡量计算机性能的一个重要指标，它是指 ）。",
        choices: ['地址总线的位数', '内存地址单元的位数', 'CPU一次能处理的二进制数的位数', 'CPU一次能处理的十进制数的位数'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "在CD光盘上标记有“CD-RW”字样，表明该光盘（ ）。",
        choices: ['只能写入一次，可以反复读出', '只能读出，不能写入', '只能写入，不能读出', '是可多次擦除型光盘'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列关于BIOS和CMOS的描述中，错误的是（ ）。",
        choices: ['BIOS存放在ROM中具有非易失性，断电后信息不会丢失', 'CMOS中存放着基本输入输出设备的驱动程序', 'BIOS是计算机软件最基础的部分，包含加载操作系统和CMOS设置等功能', 'CMOS存储器是易失性存储器'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "（ ）负责管理和控制计算机软硬件资源，是系统软件的核心。",
        choices: ['应用软件', '操作系统', '程序设计语言', '数据库管理系统'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列文件名中，正确的是（ ）。",
        choices: ['sad/jsjkhjkh/', 'YETG*DGHW', 'JDJSK.JFDSK.', 'DJD:jd[dewd]'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列（）编写的程序执行效率最高。",
        choices: ['机器语言', '面向对象程序设计语言', '汇编语言', '自然语言'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "软件工程的三要素包括（ ）、方法和工具。",
        choices: ['进程', '过程', '作业', '程序'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "在输入文本的过程中，可按（ ）键在中文输入法和英文输入法之间进切换。",
        choices: ['Shift', 'Ctrl+Shift', 'Ctrl', 'Ctrl+空格'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "在Windows中，“记事本”的默认文件格式为（ ）。",
        choices: ['.txt', '.png', '.bmp', '.doc'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "在Windows中，下列关于快捷方式的描述中，正确的是（ ）。",
        choices: ['文档、图片、音频、视频等文件都可以创建快捷方式', '同一个文件夹中，对于同一个对象，只能创建一个快捷方式', '删除某一对象的所有快捷方式，就无法正常打开该对象，但该对象并未从计算机中删除', '将某对象放入回收站，不影响该对象快捷方式的正常使用'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "C 语言中的标识符只能由字母、数字和下划线3种字符组成，且第一个字符（ ）。",
        choices: ['必须为字母', '必须为下划线', '必须为字母或下划线', '可以是字母、数字或下划线'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列关于三层交换机的描述中，正确的是（ ）。",
        choices: ['工作在网络层的上一层', '是通过硬件实现高速路由功能的设备', '使用先进的路由处理软件提高速度', '使用在对网络管理和安全要求高的场合'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "在OSI/RM参考模型的传输层中，最重要的协议是（",
        choices: ['TCP和UDP', 'TCP和IP', 'HTTP 和FTP', 'TELNET 和DNS'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列应用程序中，基于TCP协议的是（ ）。",
        choices: ['ping', 'Telnet', 'OSPF', 'SNMP'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "设置局域网中计算机的网络属性时，“默认网关”应该设置为（ ）的内网地址。",
        choices: ['DNS服务器', 'Web 服务器', '路由器', '交换机'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "影响局域网特性的技术要素不包括（ ）。",
        choices: ['网络拓扑结构', '网络的介质访问控制方法', '网络的传输介质', '网络的布线方法'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "IPv6地址 FE80:0:0:09A:FE:0:0:4CA2可以简写为（ ）。",
        choices: ['FE80::09A:FE:0:0:4CA2', 'FE80:0:0:9A:FE:0:0:4CA2', 'FE80::09A:FE::4CA2', 'FE80::9A:FE:0::4CA2'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "在Intermet域名体系中，域的下面可以划分子域，各级域名用圆点分开，按照（ ）。",
        choices: ['从左到右越来越小的方式分4层排列', '从左到右越来越小的方式分多层排列', '从右到左越来越小的方式分4层排列', '从右到左越来越小的方式分多层排列'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "在www.tshua.edu.cn这个完整域名中，主机名是（ ）。",
        choices: ['www', 'tshua', 'edu', 'cn'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "在物理连接上属于星型网络，但在逻辑上属于总线型网络的通信设备是（）。",
        choices: ['网关', '集线器', '交换机', '路由器'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列关于电子邮件的描述中，错误的是（）。",
        choices: ['电子邮件系统工作过程遵循“客户机/服务器”模式', '电子邮箱是在邮件系统中申请的一小块存储空间', '接收方计算机若处于离线状态邮件将丢失', '邮件发送协议遵循SMTP协议'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "IPv4地址由（ ）位二进制数组成。",
        choices: ['4', '16', '32', '128'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "100 bps代表每秒传输（ ）。",
        choices: ['100 MB', '100 bit', '100 KB', '100 TB'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列设备中，属于资源子网的是（ ）。",
        choices: ['打印机', '集线器', '交换机', '路由器'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "在计算机网络中，通常采用（ ）技术来证明传送报文的真实性。",
        choices: ['明文', '数字签名', '防火墙', '密钥'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列关于计算机病毒的描述中，正确的是（",
        choices: ['感染过病毒的计算机就不会再被感染', '无论良性病毒还是恶性病毒，计算机感染后都会使数据不能正常使用或丢失', '任何一款杀毒软件都无法查杀所有病毒', '正版的软件使用起来比较安全，不会感染计算机病毒'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "使用大量垃圾信息占用带宽（拒绝服务）的攻击，破坏的是（",
        choices: ['保密性', '完整性', '可用性', '可靠性'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "下列关于系统更新的描述中，正确的是（ ）。",
        choices: ['系统更新后，便不会再受病毒的攻击', '系统更新可以修复操作系统漏洞', '系统更新只能从软件官方网站下载补丁包', '所有的更新应及时下载并安装，否则系统会立即崩溃'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "多媒体个人计算机的英文缩写是（）。",
        choices: ['CPU', 'DPC', 'MPC', 'PHP'],
        answer: 2,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "若图像的颜色深度为8，则支持的颜色数目有（）种。",
        choices: ['8', '32', '128', '256'],
        answer: 3,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "通常防火墙建立在一个网络的（ ）。",
        choices: ['每个子网的内部', '内部网络与外部网络交叉点', '部分内部网络与外部网络的结合处', '内部子网之间传送信息的中枢'],
        answer: 1,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "电影画面的帧速率一般为（）fps。",
        choices: ['24', '25', '30', '31'],
        answer: 0,
        mapping: [0, 1, 2, 3],
        count: 0
    },
    {
        type: "choice",
        content: "计算机中图像的分辨率指的是（ ）。",
        choices: ['屏幕上能够显示的像素数目', '图像单位长度上的像素个数', '用厘米表示的图像的实际尺寸大小', '图像包含的颜色数'],
        answer: 1,
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
        document.getElementById("choose_btn1").textContent = "这是第一个答案";
        document.getElementById("choose_btn2").textContent = "这是第二个答案";
        document.getElementById("choose_btn3").textContent = "这是第三个答案";
        document.getElementById("choose_btn4").textContent = "这是第四个答案";
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
            document.getElementById("choose_btn" + (i + 1)).textContent = questions[qi].choices[no];
        }
    } else {
        document.getElementById("choose_btn3").hidden = true;
        document.getElementById("choose_btn4").hidden = true;
        questions[qi].count += 1;
        document.getElementById("question_count_text").textContent = "这是第" + questions[qi].count + "次做本题";
        document.getElementById("question_text").textContent = questions[qi].content;
        document.getElementById("choose_btn1").textContent = "正确";
        document.getElementById("choose_btn2").textContent = "错误";
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

