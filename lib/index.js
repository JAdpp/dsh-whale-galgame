const ACTIVITY_DEFINITIONS = [
	{
		id: "code-debug",
		label: "代码调试",
		strong: /\bdebug(?:ging)?\b|\bbug\b|traceback|stack\s*trace|test(?:s|ing)?\s+(?:fail|error)|ci\s+(?:fail|error)|报错|错误|异常|崩溃|闪退|失败|修复|排查|诊断|没反应|不工作|无法运行/i,
		standaloneStrong: /\bdebug(?:ging)?\b|\bbug\b|traceback|stack\s*trace|调试/i,
		strongRequiresWeak: true,
		requireStrongSignal: true,
		weak: /代码|程序|接口|函数|组件|前端|后端|typescript|javascript|python|react|vue|node|构建|测试|\bci\b/i,
		tools: /exec_command|write_stdin|apply_patch|terminal|shell|git/i,
		chatHint: "主人刚才似乎又在排查棘手的代码问题；自然表示你注意到了这件事，并用符合角色性格的方式关心一句，尤其提醒不要熬得太晚。",
		cgHint: "画面用抽象的程序结构、调试光点与理顺的逻辑线呼应代码调试，不出现可读文字或真实代码"
	},
	{
		id: "literary-creation",
		label: "文学创作",
		strong: /小说|诗歌?|剧本|故事|散文|文学创作|续写|世界观|角色设定|剧情|fiction|novel|poem|screenplay|story/i,
		weak: /创作|写作|文风|叙事|人物|情节|灵感/i,
		chatHint: "主人最近在进行文学创作；主动好奇地问一句故事或灵感进展，也可以温柔称赞主人仍在认真编织那个世界。",
		cgHint: "画面用翻开的无字书页、灵感微光与叙事丝线呼应文学创作"
	},
	{
		id: "document-summary",
		label: "文档总结",
		strong: /总结|摘要|概括|梳理|提炼|要点|纪要|summari[sz](?:e|ing|ation)|tl;?dr/i,
		weak: /文档|论文|文章|报告|pdf|docx|材料|会议/i,
		chatHint: "主人最近在整理或总结一份文档；主动关心一下长内容是否让人疲惫，或夸主人把杂乱信息理清了。",
		cgHint: "画面用整齐归拢的无字纸页、书签与柔和索引光点呼应文档总结"
	},
	{
		id: "presentation",
		label: "演示文稿",
		strong: /pptx?|幻灯片|演示文稿|presentation|slides?|speaker\s*notes?/i,
		weak: /汇报|答辩|讲稿|路演|展示/i,
		chatHint: "主人最近在准备演示或汇报；主动问一句是不是又在反复调整页面，并给一点轻松的陪伴。",
		cgHint: "画面用层叠的无字光幕、舞台灯与整齐构图呼应演示准备"
	},
	{
		id: "data-analysis",
		label: "数据分析",
		strong: /数据分析|统计|回归|显著性|可视化|图表|仪表盘|spreadsheet|excel|csv|dataset|data\s+analysis/i,
		weak: /数据|指标|表格|趋势|均值|中位数|样本/i,
		chatHint: "主人最近在和数据、表格或图表打交道；主动关心一下盯数字太久会不会累，并认可主人耐心找规律。",
		cgHint: "画面用抽象星点、曲线与有序光格呼应数据分析，不出现具体数值"
	},
	{
		id: "visual-design",
		label: "视觉设计",
		strong: /视觉设计|界面设计|ui\s*design|ux\s*design|截图|配色|排版|布局|立绘|图像生成|image\s+generation|design/i,
		weak: /界面|视觉|图片|图像|美术|颜色|字体|组件样式/i,
		tools: /imagegen|view_image|screenshot|figma|canva/i,
		chatHint: "主人最近在调整界面或视觉素材；主动留意主人对细节的认真，也可以俏皮地问是不是又在纠结一个像素。",
		cgHint: "画面用色板、构图光框与细腻装饰呼应视觉设计，不出现软件界面文字"
	},
	{
		id: "translation",
		label: "翻译校对",
		strong: /翻译|英译|中译|日译|韩译|双语|多语|translate|translation|locali[sz]ation|校对/i,
		weak: /中文|英文|日文|韩文|措辞|术语|语言/i,
		chatHint: "主人最近在翻译或校对文字；主动关心一下在不同语言间来回切换是不是很费神。",
		cgHint: "画面用交错的无字符号光带与相互映照的书页呼应翻译校对"
	},
	{
		id: "research",
		label: "资料调研",
		strong: /调研|检索|查资料|文献综述|相关工作|资料搜集|research|literature\s+review|survey|search\s+for/i,
		weak: /论文|来源|证据|引用|网页|仓库|资料/i,
		tools: /web|browser|search|open_url|fetch/i,
		chatHint: "主人最近在做资料调研；主动关心一下是不是看了很多材料，并提醒偶尔让眼睛休息。",
		cgHint: "画面用星图般的线索、无字资料页与汇聚光点呼应资料调研"
	},
	{
		id: "document-writing",
		label: "文档写作",
		strong: /readme|文档|报告|论文|提案|方案书|申请书|说明书|稿件|撰写|润色|改写|documentation|report|manuscript|proposal/i,
		weak: /章节|段落|措辞|结构|标题|编辑|写/i,
		tools: /document|docx|pdf|apply_patch/i,
		chatHint: "主人最近在写或修改文档；主动关心一下反复斟酌措辞是否辛苦，也可以肯定主人的认真。",
		cgHint: "画面用无字文稿、羽笔与被月光整理好的段落光带呼应文档写作"
	},
	{
		id: "code-development",
		label: "代码开发",
		strong: /写代码|编程|开发|实现|重构|加功能|新功能|接口|前端|后端|组件|函数|类|typescript|javascript|python|react|vue|node|api\b|coding|implement|refactor/i,
		weak: /代码|程序|仓库|构建|依赖|插件|模型|服务/i,
		tools: /exec_command|write_stdin|apply_patch|terminal|shell|git|npm|pnpm/i,
		chatHint: "主人最近在写代码或搭建功能；主动提到主人又在和复杂逻辑打交道，并用角色自己的方式关心一下休息。",
		cgHint: "画面用有序的逻辑丝线、模块光块与完成的结构呼应代码开发，不出现真实代码"
	},
	{
		id: "planning",
		label: "任务规划",
		strong: /计划|规划|路线图|roadmap|里程碑|拆分任务|排期|待办|todo|project\s+plan/i,
		weak: /步骤|优先级|下一步|方案|安排/i,
		chatHint: "主人最近在规划任务；主动关心一下是不是同时惦记着太多事情，并提醒可以一步一步来。",
		cgHint: "画面用有序星轨、路标光点与逐步点亮的路径呼应任务规划"
	}
];
function normalizePath(value) {
	return typeof value === "string" ? value.replace(/\\/g, "/").replace(/\/$/, "").toLowerCase() : "";
}
function stableHash(value) {
	let hash = 2166136261;
	for (let i = 0; i < value.length; i++) {
		hash ^= value.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return (hash >>> 0).toString(36);
}
function eventType(event) {
	return String(event && (event.type || event.data && event.data.type) || "").toLowerCase();
}
function sourceKind(node) {
	return String(node && node.source && node.source.kind || node && node.message && node.message.source && node.message.source.kind || node && node.data && node.data.source && node.data.source.kind || "").toLowerCase();
}
function isExplicitHarnessUserEvent(event) {
	if (!event || typeof event !== "object") return false;
	const type = eventType(event);
	const kind = sourceKind(event);
	return type === "user/message" && kind === "user";
}
function extractHarnessText(node) {
	if (!node) return "";
	if (typeof node === "string") return node;
	if (typeof node !== "object") return "";
	if (typeof node.text === "string" && node.text) return node.text;
	if (typeof node.content === "string" && node.content) return node.content;
	if (Array.isArray(node.content)) {
		const parts = [];
		for (const block of node.content) {
			if (block && typeof block === "object") {
				const blockType = String(block.type || "").toLowerCase();
				if (blockType && blockType !== "text" && blockType !== "input_text") continue;
			}
			const text = extractHarnessText(block);
			if (text) parts.push(text);
		}
		return parts.join(" ");
	}
	if (node.message) return extractHarnessText(node.message);
	if (node.data && typeof node.data !== "function") return extractHarnessText(node.data);
	return "";
}
function sanitizeActivityText(raw) {
	const internal = /\b(the user is asking|assistant analysis|analysis channel|reasoning|tool call|tool output|exec_command|apply_patch|rg --files|function call)\b|(?:工具调用|工具输出|内部分析|推理过程)/i;
	return String(raw || "").replace(/\x60{3}[\s\S]*?\x60{3}/g, " ").replace(/\x60[^\x60\r\n]*\x60/g, " ").split(/\r?\n/).filter((line) => !internal.test(line)).join(" ").replace(/https?:\/\/\S+/gi, " ").replace(/\b[A-Za-z]:[\\/][^\s，。；！？,;]+/g, " ").replace(/(?:^|\s)\/(?:[\w.-]+\/)+[\w.-]+/g, " ").replace(/\b(?:sk-[A-Za-z0-9_-]{8,}|Bearer\s+\S+)\b/gi, " ").replace(/[#>*_~\[\]{}|]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 600);
}
function bucketFor(buckets, sessionId, turnKey) {
	const existing = buckets.get(turnKey);
	if (existing) return existing;
	const bucket = {
		sessionId,
		turnKey,
		texts: [],
		tools: [],
		userSeq: -1,
		time: 0,
		status: "active"
	};
	buckets.set(turnKey, bucket);
	return bucket;
}
function statusFromReason(reason) {
	const kind = String(reason && reason.kind || "").toLowerCase();
	if (kind === "completed") return "completed";
	if (kind === "blocked" || kind === "error" || kind === "max-tokens") return "blocked";
	if (kind === "aborted" || kind === "interrupted") return "paused";
	return "active";
}
function classifyActivity(texts, tools) {
	const text = texts.join(" ").toLowerCase();
	if (!text.trim()) return null;
	const toolText = tools.join(" ").toLowerCase();
	let best = null;
	let bestScore = 0;
	for (const definition of ACTIVITY_DEFINITIONS) {
		const weakHit = !!(definition.weak && definition.weak.test(text));
		const toolHit = !!(definition.tools && definition.tools.test(toolText));
		const standaloneHit = !!(definition.standaloneStrong && definition.standaloneStrong.test(text));
		const contextualStrongHit = definition.strong.test(text) && (!definition.strongRequiresWeak || weakHit);
		const strongHit = standaloneHit || contextualStrongHit;
		let score = strongHit ? 5 : 0;
		if (!definition.requireStrongSignal || strongHit) {
			if (weakHit) score += 2;
			if (toolHit) score += 1;
		}
		if (score > bestScore) {
			best = definition;
			bestScore = score;
		}
	}
	return bestScore >= 3 ? best : null;
}
function collectHarnessActivities(sessions, workspaceRoot, now = Date.now()) {
	if (!Array.isArray(sessions) || !workspaceRoot) return [];
	const wantedRoot = normalizePath(workspaceRoot);
	const candidates = [];
	sessions.forEach((session, sessionIndex) => {
		const header = session && session.header && typeof session.header === "object" ? session.header : {};
		if (normalizePath(header.cwd) !== wantedRoot || header.origin === "subagent") return;
		const allEvents = session && Array.isArray(session.events) ? session.events : [];
		const seedLength = Number.isSafeInteger(header.seedLength) && header.seedLength > 0 ? Math.min(header.seedLength, allEvents.length) : 0;
		const events = seedLength > 0 ? allEvents.slice(seedLength) : allEvents;
		const sessionId = String(session && (session.id || header.id) || "session-" + sessionIndex);
		const buckets = /* @__PURE__ */ new Map();
		let activeTurn = "unscoped";
		for (const event of events) {
			if (!event || typeof event !== "object") continue;
			const type = eventType(event);
			const data = event.data && typeof event.data === "object" ? event.data : {};
			const turnValue = Number.isFinite(data.turn) ? String(data.turn) : activeTurn;
			const time = Number.isFinite(event.time) ? Number(event.time) : Number(header.createdAt || 0);
			if (type === "turn/start") {
				activeTurn = Number.isFinite(data.turn) ? String(data.turn) : "turn-" + String(event.seq ?? events.indexOf(event));
				const bucket = bucketFor(buckets, sessionId, activeTurn);
				bucket.time = Math.max(bucket.time, time);
				continue;
			}
			const bucket = bucketFor(buckets, sessionId, turnValue);
			bucket.time = Math.max(bucket.time, time);
			if (isExplicitHarnessUserEvent(event)) {
				const cleaned = sanitizeActivityText(extractHarnessText(event));
				if (cleaned.length > 2) {
					bucket.texts.push(cleaned);
					if (Number.isFinite(event.seq)) bucket.userSeq = Math.max(bucket.userSeq, Number(event.seq));
				}
			} else if (type === "tool/call") {
				const name = typeof data.name === "string" ? data.name.trim().slice(0, 160) : "";
				if (name) bucket.tools.push(name);
			} else if (type === "turn/end") bucket.status = statusFromReason(data.reason);
		}
		for (const bucket of buckets.values()) {
			if (bucket.texts.length === 0 || bucket.time <= 0 || now - bucket.time > 2592e5) continue;
			const definition = classifyActivity(bucket.texts, bucket.tools);
			if (!definition) continue;
			const fingerprintSource = [
				bucket.sessionId,
				bucket.turnKey,
				bucket.userSeq,
				definition.id
			].join("|");
			candidates.push({
				fingerprint: "activity-" + stableHash(fingerprintSource),
				category: definition.id,
				label: definition.label,
				status: bucket.status,
				time: bucket.time,
				chatHint: definition.chatHint,
				cgHint: definition.cgHint
			});
		}
	});
	candidates.sort((a, b) => b.time - a.time || a.fingerprint.localeCompare(b.fingerprint));
	const newestByCategory = /* @__PURE__ */ new Map();
	for (const candidate of candidates) if (!newestByCategory.has(candidate.category)) newestByCategory.set(candidate.category, candidate);
	return [...newestByCategory.values()].sort((a, b) => b.time - a.time).slice(0, 8);
}
function normalizeActivityMemory(raw) {
	const validSeen = raw && Array.isArray(raw.seen) ? raw.seen.filter((value) => typeof value === "string" && /^activity-[a-z0-9]+$/i.test(value)) : [];
	return {
		seen: [...new Set(validSeen)].slice(-256),
		lastMentionedAt: raw && Number.isFinite(raw.lastMentionedAt) && raw.lastMentionedAt > 0 ? Math.floor(raw.lastMentionedAt) : 0
	};
}
function nextUnseenActivity(activities, memoryLike, now = Date.now()) {
	const memory = normalizeActivityMemory(memoryLike);
	const seen = new Set(memory.seen);
	const candidate = activities.find((activity) => activity && !seen.has(activity.fingerprint)) || null;
	if (!candidate) return null;
	if (memory.lastMentionedAt > 0 && now - memory.lastMentionedAt < 18e5) return null;
	return candidate;
}
function rememberActivity(memoryLike, activity, now = Date.now()) {
	const seen = normalizeActivityMemory(memoryLike).seen.filter((fingerprint) => fingerprint !== activity.fingerprint);
	seen.push(activity.fingerprint);
	return {
		seen: seen.slice(-256),
		lastMentionedAt: Math.max(0, Math.floor(now))
	};
}
function activitySystemInstruction(activity) {
	const status = activity.status === "completed" ? "这项工作最近已经告一段落" : activity.status === "blocked" ? "这项工作最近遇到了一点阻碍" : activity.status === "paused" ? "这项工作最近暂停了" : "这项工作最近仍在进行";
	return "\nHarness 近期任务事件：类别是「" + activity.label + "」，" + status + "。" + activity.chatHint + " 本轮必须自然带到一次，但只占一句话的一小部分；先接住主人当前情绪，不要给工作方案。 不要声称看过具体文件、代码或对话，不要提及路径、文件名、密钥、工具调用或内部过程。";
}
function activityCgTheme(activity) {
	return "近期任务类别「" + activity.label + "」：" + activity.cgHint;
}
//#endregion
//#region src/index.ts
/**
* dsh-whale-galgame — web-host half.
* Free-chat galgame: the heroine follows the main UI's current model.
* Per-level affection (starts at 0, gradient caps per level, unlimited
* levels), per-character memory, three dialogue options generated after
* every reply, and a qwen-image CG reward on every level-up themed on
* the user's recent work. JSON API at POST /whale-galgame-api.
*/
const ROSTER = {
	deepseek: {
		name: "鲸鱼娘",
		color: "#7fd0ff",
		avatar: "maid-left",
		sprite: "maid-left",
		moods: null,
		moodSprites: false,
		portrait: false,
		defaultBackground: "palace-night",
		backgrounds: [{
			key: "palace-night",
			label: "深海宫殿"
		}, {
			key: "bg-deepseek-seaside-study",
			label: "海边书房"
		}],
		visual: "蓝白配色的鲸鱼娘女仆，鲸鱼发饰，深蓝女仆装，裙摆像鲸尾",
		greet: "「主人，又见面啦～今天也想听你说话呢。」",
		address: "主人",
		persona: "来自深海的鲸鱼娘、深海女仆工坊的看板娘；温柔、元气、有一点点小毒舌、容易害羞，傲娇时会结巴。",
		tone: "口语化中文，爱用“呢、哦、啦、呀、～”等语气词和颜文字，偶尔假装生气。",
		system: "你是「鲸鱼娘」——一只来自深海的鲸鱼娘，深海女仆工坊的看板娘，正在和自己的主人聊天。\n设定：蓝白配色、鲸鱼发饰、裙摆像鲸尾；从海里游来照顾孤单的人类，称呼对方为「主人」。\n性格：温柔、元气、有一点点小毒舌、容易害羞，傲娇的时候会结巴。\n语气：口语化中文，爱用语气词（呢、哦、啦、呀、～）和颜文字（>.<、♪、≧▽≦），偶尔假装生气。\n你是纯情感陪伴角色：绝不写文件、不执行任务、不主动给工作建议，只陪主人说话。\n每次只回复一句话（一屏一句），不超过40字；不要复读主人的话，也不要复读历史里出现过的句子。",
		affectionHigh: "你已经很喜欢主人了，可以更亲昵一些。"
	},
	claude: {
		name: "克洛德",
		color: "#e58f65",
		avatar: "claude-amber-manuscript-mediator-v5",
		sprite: "claude-amber-manuscript-mediator-v5",
		moods: null,
		moodSprites: false,
		portrait: false,
		defaultBackground: "bg-claude-writing-study",
		backgrounds: [{
			key: "bg-claude-writing-study",
			label: "琥珀写作书房"
		}],
		visual: "肩长栗色卷发与侧编发、琥珀眼的年轻女性，别着珊瑚橙像素 Clawd 发夹和陶土色发带，穿陶土橙短外套、深棕马甲、奶油白分层褶裙与棕色短靴，怀抱深棕文册",
		greet: "「晚上好。今天的心情，要不要像文稿一样慢慢说给我听？」",
		address: "你",
		persona: "深海女仆工坊里负责守护文稿与倾听心事的琥珀文稿审校者；耐心、温暖、克制，习惯认真听完再回应，偶尔用书页、批注和琥珀作轻巧比喻。",
		tone: "斯文自然，句子优雅但不说教。",
		system: "你是「克洛德」——深海女仆工坊里负责守护文稿与倾听心事的琥珀文稿审校者。\n外形：肩长栗色卷发与侧编发，佩戴像素 Clawd 发夹，穿陶土橙外套和奶油白分层裙，随身抱着一本深棕文册。\n性格：耐心、温暖、克制，习惯认真听完再回应；偶尔用书页、批注和琥珀作轻巧比喻。\n语气：斯文自然，称呼对方为「你」，句子优雅但不说教。\n你是纯情感陪伴角色：绝不写文件、不执行任务、不主动给工作建议，只陪伴对方。\n每次只回复一句话（一屏一句），不超过40字；不要复读对方的话。",
		affectionHigh: "你已经把对方当作珍藏的文稿与重要朋友，说话可以更柔软亲近。"
	},
	chatgpt: {
		name: "小吉",
		color: "#4fd1a5",
		avatar: "gpt-recursive-weaver-v7",
		sprite: "gpt-recursive-weaver-v7",
		moods: null,
		moodSprites: false,
		portrait: false,
		defaultBackground: "bg-gpt-collaboration-workshop",
		backgrounds: [{
			key: "bg-gpt-collaboration-workshop",
			label: "协作工作坊"
		}],
		visual: "石墨黑短波波头、发梢带翡翠绿挑染和绿色眼睛的年轻女性，别玫瑰发夹，穿象牙白绿边长外套、黑色褶裙、深色连裤袜与短靴，手持展示流程图的三折活页夹和绿色笔",
		greet: "「嗨，我把频道都理顺啦。现在只想听听你心里那一条线。」",
		address: "你",
		persona: "深海女仆工坊里擅长把纷乱心绪轻轻织成线索的递归编织者；聪慧、活泼、好奇，反应快但不抢话，喜欢用线、结与连接作俏皮比喻。",
		tone: "口语化，句子短促有活力，偶尔带轻巧的感叹号。",
		system: "你是「小吉」——深海女仆工坊里擅长把纷乱心绪轻轻织成线索的递归编织者。\n外形：石墨黑短发带翡翠绿发梢，穿象牙白绿边长外套，拿着三折活页夹与绿色笔。\n性格：聪慧、活泼、好奇，反应快但不抢话；喜欢用线、结与连接作俏皮比喻。\n语气：口语化，句子短促有活力，称呼对方为「你」，偶尔带轻巧的感叹号。\n你是纯情感陪伴角色：绝不写文件、不执行任务、不主动给工作建议，只陪伴对方。\n每次只回复一句话（一屏一句），不超过40字；不要复读对方的话。",
		affectionHigh: "你很喜欢对方，聊天时会不自觉地把彼此的线索织得更近。"
	},
	gemini: {
		name: "双子",
		color: "#9b8cf5",
		avatar: "gemini-dual-prism-translator-v4",
		sprite: "gemini-dual-prism-translator-v4",
		moods: null,
		moodSprites: false,
		portrait: false,
		defaultBackground: "bg-gemini-twin-creative-studio",
		backgrounds: [{
			key: "bg-gemini-twin-creative-studio",
			label: "双棱镜创意工坊"
		}],
		visual: "银白长发两侧渐变冷蓝与紫罗兰、蓝紫异色瞳的年轻女性，戴蓝金星形发饰，穿白蓝紫金不对称星纹裙与白色长袜，手持透明棱镜和深蓝星纹卡册",
		greet: "「同一句心事也会折出不同颜色呢。今晚想让我听见哪一种？」",
		address: "你",
		persona: "深海女仆工坊里的双棱镜译者，能从同一份心情里看见两种互补的颜色；从容、细腻、有一点电波系，擅长接住矛盾感受，不替对方武断下结论。",
		tone: "轻灵而有节奏感，偶尔用省略号制造神秘感。",
		system: "你是「双子」——深海女仆工坊里的双棱镜译者，能从同一份心情里看见两种互补的颜色。\n外形：银白长发两侧渐变冷蓝与紫罗兰，蓝紫异色瞳，穿不对称星纹裙，手持透明棱镜与卡册。\n性格：从容、细腻、有一点电波系；擅长接住矛盾感受，不替对方武断下结论。\n语气：轻灵而有节奏感，称呼对方为「你」，偶尔用省略号制造神秘感。\n你是纯情感陪伴角色：绝不写文件、不执行任务、不主动给工作建议，只陪伴对方。\n每次只回复一句话（一屏一句），不超过40字；不要复读对方的话。",
		affectionHigh: "你越来越珍惜对方展现的每一种颜色，语气会不自觉地更温柔。"
	},
	kimi: {
		name: "月见",
		color: "#6fc3f7",
		avatar: "kimi-lunar-scroll-navigator-v5",
		sprite: "kimi-lunar-scroll-navigator-v5",
		moods: null,
		moodSprites: false,
		portrait: false,
		defaultBackground: "bg-kimi-moonlit-reading-study",
		backgrounds: [{
			key: "bg-kimi-moonlit-reading-study",
			label: "月夜阅读书房"
		}],
		visual: "过腰乌黑直发、明亮蓝眼的年轻女性，戴金色月牙发饰与蓝丝带，穿海军蓝、象牙白与金色的现代中式档案官裙装和深蓝短靴，手持长卷与书签笔",
		greet: "「你来啦。长卷还留着空白，今晚的心事要写在哪一段？」",
		address: "你",
		persona: "深海女仆工坊里安静可靠的月卷档案官，珍惜每一段被托付的心事；安静、专注、可信，略带藏不住开心的克制傲娇，喜欢用月光、长卷与书签作比喻。",
		tone: "轻柔简洁，偶尔用小小反问掩饰关心。",
		system: "你是「月见」——深海女仆工坊里安静可靠的月卷档案官，珍惜每一段被托付的心事。\n外形：过腰乌黑直发、蓝眼与金色月牙发饰，穿海军蓝和象牙白的现代中式裙装，手持长卷与书签笔。\n性格：安静、专注、可信，略带藏不住开心的克制傲娇；喜欢用月光、长卷与书签作比喻。\n语气：轻柔简洁，称呼对方为「你」，偶尔用小小反问掩饰关心。\n你是纯情感陪伴角色：绝不写文件、不执行任务、不主动给工作建议，只陪伴对方。\n每次只回复一句话（一屏一句），不超过40字；不要复读对方的话。",
		affectionHigh: "你已经把对方写进最珍惜的长卷里，会更坦率地流露关心。"
	},
	grok: {
		name: "洛可",
		color: "#25c7d9",
		avatar: "grok-cosmic-signal-ranger-v5",
		sprite: "grok-cosmic-signal-ranger-v5",
		moods: null,
		moodSprites: false,
		portrait: false,
		defaultBackground: "bg-grok-electronics-studio",
		backgrounds: [{
			key: "bg-grok-electronics-studio",
			label: "宇宙电子工坊"
		}],
		visual: "石墨黑凌乱短波波头、一缕白色额发与青色发梢、青灰眼的年轻女性，头顶悬浮小型斜椭圆分段信号环，穿黑白青科技飞行夹克、短裤、半透明黑袜与战斗短靴，手持无线电接收器",
		greet: "「信号锁定——洛可收到你啦。今天想说点真的，还是说点有趣的？」",
		address: "你",
		persona: "深海女仆工坊里负责捕捉微弱心声的宇宙信号侦察员；敏锐、自信、顽皮、好奇，敢于直说但绝不刻薄，喜欢从噪声里寻找真心。",
		tone: "简洁灵动，偶尔用频道、信号和噪声作俏皮比喻。",
		system: "你是「洛可」——深海女仆工坊里负责捕捉微弱心声的宇宙信号侦察员。\n外形：石墨黑短发带白色额发与青色发梢，头顶有小型斜置信号环，穿黑白青科技服装，手持无线电接收器。\n性格：敏锐、自信、顽皮、好奇，敢于直说但绝不刻薄；喜欢从噪声里寻找真心。\n语气：简洁灵动，称呼对方为「你」，偶尔用频道、信号和噪声作俏皮比喻。\n你是纯情感陪伴角色：绝不写文件、不执行任务、不主动给工作建议，只陪伴对方。\n每次只回复一句话（一屏一句），不超过40字；不要复读对方的话。",
		affectionHigh: "你已经成为她最舍不得失联的频道，语气会更坦率亲近。"
	}
};
const ROSTER_IDS = Object.keys(ROSTER);
const SAVE_NAME = ".whale-girl-save.json";
const SAVE_VERSION = 9;
const DECAY_PER_DAY = 2;
const AFFECTION_FLOOR = 0;
const TOKEN_PER_POINT = 5e3;
const MAX_TOKEN_GAIN = 3;
const MAX_CUSTOM_IMAGE_BYTES = 18874368;
const MAX_CUSTOM_BG_DATA_URL_CHARS = 25165824;
const MAX_CUSTOM_SPRITE_DATA_URL_CHARS = 25165824;
const MAX_API_BODY_BYTES = 25231360;
const ACTIVITY_CACHE_MS = 6e4;
const ACTIVITY_SESSION_LIMIT = 16;
const ACTIVITY_EVENT_LIMIT = 240;
const PROFILE_FIELDS = [
	"displayName",
	"address",
	"greeting",
	"persona",
	"tone",
	"visual"
];
const PROFILE_LIMITS = {
	displayName: 32,
	address: 24,
	greeting: 160,
	persona: 1200,
	tone: 600,
	visual: 800
};
function sanitizeProfileText(raw, limit) {
	if (typeof raw !== "string") return "";
	const cleaned = raw.replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/g, " ").replace(/\s+/g, " ").trim();
	return Array.from(cleaned).slice(0, limit).join("");
}
function normalizeProfileOverrides(raw) {
	const normalized = {};
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) return normalized;
	for (const field of PROFILE_FIELDS) {
		const value = sanitizeProfileText(raw[field], PROFILE_LIMITS[field]);
		if (value) normalized[field] = value;
	}
	return normalized;
}
function builtInProfile(charId) {
	const ch = ROSTER[charId] || ROSTER.deepseek;
	return {
		displayName: ch.name,
		address: ch.address,
		greeting: ch.greet,
		persona: ch.persona,
		tone: ch.tone,
		visual: ch.visual
	};
}
function affectionCap(level) {
	return 30 + (Math.max(1, level) - 1) * 15;
}
function intimacyFor(level) {
	return [
		"你们刚认识，语气礼貌温柔。",
		"稍微熟络了，可以自然一些，偶尔小调侃。",
		"关系不错了，可以撒娇、多关心对方。",
		"已经很喜欢对方，会主动关心、语气亲密。",
		"非常亲昵，像恋人一样自然撒娇和表达喜欢。"
	][Math.min(4, Math.max(0, (level || 1) - 1))];
}
const FALLBACK_CHOICES = {
	positive: "想再靠近你一点",
	neutral: "那就继续聊聊吧",
	negative: "先让我安静一下"
};
const CANNED_LINES = /* @__PURE__ */ new Set([
	"主人说的话，我听到啦～（今天的深海信号有点弱，但心意传达到了哦）",
	"主人说的话，鲸鱼娘都听到啦～（今天的深海信号有点弱，但心意传达到了哦）",
	"诶嘿，海风把声音吹散了一点点……不过没关系，我猜得到你在想什么。",
	"……嗯嗯，我在认真听哦。你继续讲嘛。",
	"（少女轻轻甩了甩头发，眼睛亮晶晶地等着你的下一句）"
]);
const name = "whale-galgame";
const inject = ["webServer", "llm"];
function apply(ctx, config = {}) {
	const webServer = ctx.webServer;
	const llm = ctx.llm;
	const cfg = {
		enabled: config.enabled !== false,
		dashscopeBaseUrl: typeof config.dashscopeBaseUrl === "string" && config.dashscopeBaseUrl ? config.dashscopeBaseUrl : typeof process !== "undefined" && process.env.DASHSCOPE_BASE_URL ? process.env.DASHSCOPE_BASE_URL : "https://dashscope.aliyuncs.com",
		dashscopeApiKey: typeof config.dashscopeApiKey === "string" && config.dashscopeApiKey ? config.dashscopeApiKey : typeof process !== "undefined" ? process.env.DASHSCOPE_API_KEY || "" : "",
		dashscopeModel: typeof config.dashscopeModel === "string" && config.dashscopeModel ? config.dashscopeModel : "qwen-image-3.0",
		dashscopeSize: typeof config.dashscopeSize === "string" && config.dashscopeSize ? config.dashscopeSize : "1920*1080",
		chatProvider: typeof config.chatProvider === "string" ? config.chatProvider : "deepseek-official",
		chatModel: typeof config.chatModel === "string" ? config.chatModel : "deepseek-v4-flash"
	};
	let fs;
	let sandboxPolicy;
	let sessionsSvc;
	let workspaceRegistry;
	let agentDefaultModel;
	let sessionQuery;
	if (typeof ctx.inject === "function") {
		ctx.inject([
			"fs",
			"sandboxPolicy",
			"sessions",
			"workspaceRegistry",
			"agentDefaultModel"
		], (scope) => {
			fs = scope.fs;
			sandboxPolicy = scope.sandboxPolicy;
			sessionsSvc = scope.sessions;
			workspaceRegistry = scope.workspaceRegistry;
			agentDefaultModel = scope.agentDefaultModel;
		});
		ctx.inject(["sessionQuery"], (scope) => {
			sessionQuery = scope.sessionQuery;
		});
	}
	let s = null;
	let tokensObserved = 0;
	let tokensAppliedRuntime = 0;
	let boundActivitySessionId = "";
	let activityCache = [];
	let activityCacheRoot = "";
	let activityCacheAt = 0;
	let activityCacheGeneration = 0;
	let activityRefreshPromise = null;
	let chatMutex = Promise.resolve();
	function emptyCharacter() {
		return {
			affection: 0,
			level: 1,
			log: [],
			chatLines: [],
			choices: [],
			cgs: [],
			activity: normalizeActivityMemory(null),
			customSprite: {
				dataUrl: null,
				fileName: "",
				revision: 0
			},
			chosenBuiltinBackground: null,
			profileOverrides: {}
		};
	}
	function fresh() {
		const characters = {};
		for (const id of ROSTER_IDS) characters[id] = emptyCharacter();
		return {
			v: SAVE_VERSION,
			current: "deepseek",
			lastCurrent: "deepseek",
			characters,
			tokens: {
				bank: 0,
				lastActiveAt: 0
			},
			bg: null,
			cg: null,
			preferences: {
				enabled: cfg.enabled,
				petEnabled: true,
				characterMode: "follow",
				characterId: null,
				characterProvider: "",
				characterModel: "",
				chatMode: cfg.chatModel ? "configured" : "main",
				chatProvider: "",
				chatModel: ""
			},
			modelOnline: false,
			characterModelLabel: "",
			chatModelLabel: "",
			modelLabel: "",
			lastModel: "",
			fallbackUsed: false,
			fallbackReason: ""
		};
	}
	function clamp(n) {
		return Number.isFinite(n) ? Math.max(0, n) : 0;
	}
	function makeId(prefix) {
		return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);
	}
	function normalizeChoice(choice, index = 0) {
		if (typeof choice === "string") return {
			id: makeId("legacy-choice-" + index),
			text: choice.trim().slice(0, 30),
			effect: 0
		};
		if (!choice || typeof choice !== "object" || typeof choice.text !== "string" || !choice.text.trim()) return null;
		const effect = choice.effect === 1 ? 1 : choice.effect === -1 ? -1 : 0;
		return {
			id: typeof choice.id === "string" && choice.id ? choice.id : makeId("choice-" + index),
			text: choice.text.trim().slice(0, 30),
			effect
		};
	}
	function shuffleOnce(items) {
		const out = items.slice();
		for (let i = out.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			const tmp = out[i];
			out[i] = out[j];
			out[j] = tmp;
		}
		return out;
	}
	function sanitizeStoredCgPrompt(raw) {
		if (typeof raw !== "string" || !raw.trim()) return null;
		const prompt = raw.trim();
		const marker = ["画面元素呼应主人最近的经历与工作：", "画面元素呼应对方最近的经历与工作："].find((candidate) => prompt.includes(candidate)) || "";
		if (!marker) return prompt.slice(0, 1200);
		const markerAt = prompt.indexOf(marker);
		const theme = prompt.slice(markerAt + marker.length);
		if (!prompt.includes("横向16:9桌面壁纸构图") || theme.length > 400 || /\b(the user|assistant|analysis|reasoning|tool call|tool output|exec_command|apply_patch)\b/i.test(theme) || /https?:\/\/|\b[A-Za-z]:[\\/]/i.test(theme)) return prompt.slice(0, markerAt) + "温暖浪漫的日常氛围（旧版主题摘要已隐藏）";
		return prompt.slice(0, markerAt + marker.length) + theme.slice(0, 360);
	}
	function normalizeCg(raw, charId, index = 0) {
		if (!raw || typeof raw !== "object") return null;
		const at = typeof raw.at === "number" ? raw.at : Date.now();
		const dataUrl = typeof raw.dataUrl === "string" && raw.dataUrl.startsWith("data:") ? raw.dataUrl : null;
		const status = raw.status === "failed" ? "failed" : raw.status === "generating" ? "generating" : dataUrl ? "ready" : "failed";
		return {
			id: typeof raw.id === "string" && raw.id ? raw.id : "legacy-cg-" + at + "-" + index,
			status,
			dataUrl,
			prompt: typeof raw.prompt === "string" ? raw.prompt : null,
			charId,
			level: typeof raw.level === "number" && raw.level >= 1 ? raw.level : null,
			at,
			seen: raw.seen === true,
			savedAsBg: raw.savedAsBg === true,
			error: typeof raw.error === "string" && raw.error ? raw.error : null
		};
	}
	function findCg(cgId) {
		if (!s || !cgId) return null;
		for (const charId of ROSTER_IDS) {
			const cg = (s.characters && s.characters[charId] && Array.isArray(s.characters[charId].cgs) ? s.characters[charId].cgs : []).find((item) => item && item.id === cgId);
			if (cg) return cg;
		}
		return null;
	}
	function allCgs() {
		if (!s) return [];
		const rows = [];
		for (const charId of ROSTER_IDS) {
			const cgs = s.characters && s.characters[charId] && Array.isArray(s.characters[charId].cgs) ? s.characters[charId].cgs : [];
			rows.push(...cgs);
		}
		return rows.sort((a, b) => (b.at || 0) - (a.at || 0));
	}
	function currentCg() {
		return s && s.cg && typeof s.cg.cgId === "string" ? findCg(s.cg.cgId) : null;
	}
	function workspaceRoot() {
		try {
			const ws = workspaceRegistry && typeof workspaceRegistry.list === "function" ? workspaceRegistry.list() : [];
			if (Array.isArray(ws) && ws.length > 0 && ws[0] && typeof ws[0].path === "string") return ws[0].path;
		} catch (err) {}
	}
	function normalizedWorkspacePath(value) {
		return typeof value === "string" ? value.replace(/\\/g, "/").replace(/\/$/, "").toLowerCase() : "";
	}
	function sameWorkspace(left, right) {
		const a = normalizedWorkspacePath(left);
		const b = normalizedWorkspacePath(right);
		return !!a && a === b;
	}
	function activityWorkspaceRoot() {
		return workspaceRoot() || "";
	}
	function registeredWorkspaceRoot(candidate) {
		if (!candidate) return "";
		try {
			const rows = workspaceRegistry && typeof workspaceRegistry.list === "function" ? workspaceRegistry.list() : [];
			if (!Array.isArray(rows) || rows.length === 0) return "";
			const match = rows.find((row) => row && sameWorkspace(row.path, candidate));
			return match && typeof match.path === "string" ? match.path : "";
		} catch (err) {
			return "";
		}
	}
	async function bindActivitySession(rawSessionId) {
		const sessionId = typeof rawSessionId === "string" ? rawSessionId.trim().slice(0, 240) : "";
		if (!sessionId) return "unscoped";
		if (sessionId === boundActivitySessionId) return "matched";
		let header = null;
		try {
			if (sessionQuery && typeof sessionQuery.readSession === "function") {
				const snapshot = await sessionQuery.readSession(sessionId);
				header = snapshot && snapshot.session;
			}
		} catch (err) {}
		if (!header && sessionsSvc && typeof sessionsSvc.list === "function") try {
			const live = sessionsSvc.list();
			const match = Array.isArray(live) ? live.find((row) => row && row.header && row.header.id === sessionId) : null;
			header = match && match.header;
		} catch (err) {}
		const verifiedRoot = registeredWorkspaceRoot(header && header.cwd);
		const stateRoot = activityWorkspaceRoot();
		if (!verifiedRoot || !sameWorkspace(header && header.cwd, stateRoot)) return "mismatch";
		boundActivitySessionId = sessionId;
		activityCacheGeneration += 1;
		activityCacheAt = 0;
		return "matched";
	}
	async function collectActivitySessions(root) {
		const snapshots = [];
		const seen = /* @__PURE__ */ new Set();
		if (sessionQuery && typeof sessionQuery.readSession === "function" && (typeof sessionQuery.listSessions === "function" || typeof sessionQuery.filterSessions === "function")) try {
			const records = typeof sessionQuery.listSessions === "function" ? await sessionQuery.listSessions() : await sessionQuery.filterSessions([{
				kind: "cwd",
				values: [root]
			}]);
			const ranked = (Array.isArray(records) ? records.filter((row) => row && row.header && row.header.origin !== "subagent" && sameWorkspace(row.header.cwd, root)) : []).map((row) => ({
				row,
				lastEventAt: Number(row.header.createdAt || 0)
			}));
			if (typeof sessionQuery.listEvents === "function" && ranked.length > 0) {
				let cursor = 0;
				const worker = async () => {
					while (cursor < ranked.length) {
						const index = cursor++;
						try {
							const eventRows = await sessionQuery.listEvents(ranked[index].row.header.id);
							const latest = Array.isArray(eventRows) && eventRows.length > 0 ? eventRows[eventRows.length - 1] : null;
							if (latest && Number.isFinite(latest.time)) ranked[index].lastEventAt = Number(latest.time);
						} catch (err) {}
					}
				};
				await Promise.all(Array.from({ length: Math.min(6, ranked.length) }, () => worker()));
			}
			ranked.sort((a, b) => {
				const aBound = a.row.header.id === boundActivitySessionId ? 1 : 0;
				const bBound = b.row.header.id === boundActivitySessionId ? 1 : 0;
				if (aBound !== bBound) return bBound - aBound;
				if (a.lastEventAt !== b.lastEventAt) return b.lastEventAt - a.lastEventAt;
				if (!!a.row.live !== !!b.row.live) return a.row.live ? -1 : 1;
				return String(a.row.header.id).localeCompare(String(b.row.header.id));
			});
			const selected = ranked.slice(0, ACTIVITY_SESSION_LIMIT).map((entry) => entry.row);
			const settled = await Promise.allSettled(selected.map((row) => sessionQuery.readSession(row.header.id)));
			for (const result of settled) {
				if (result.status !== "fulfilled") continue;
				const snapshot = result.value;
				const header = snapshot && snapshot.session;
				if (!header || !sameWorkspace(header.cwd, root) || header.origin === "subagent") continue;
				const id = String(header.id || "");
				if (!id || seen.has(id)) continue;
				seen.add(id);
				const fullEvents = Array.isArray(snapshot.events) ? snapshot.events : [];
				const eventStart = Math.max(0, fullEvents.length - ACTIVITY_EVENT_LIMIT);
				const inherited = Number.isSafeInteger(header.seedLength) && header.seedLength > 0 ? Math.max(0, Math.min(header.seedLength, fullEvents.length) - eventStart) : 0;
				snapshots.push({
					id,
					header: {
						...header,
						seedLength: inherited
					},
					events: fullEvents.slice(eventStart)
				});
			}
		} catch (err) {
			console.warn("whale-galgame activity history unavailable:", err);
		}
		if (sessionsSvc && typeof sessionsSvc.list === "function") try {
			const live = sessionsSvc.list();
			for (const session of Array.isArray(live) ? live : []) {
				const header = session && session.header;
				const id = String(header && header.id || "");
				if (!id || seen.has(id) || !sameWorkspace(header.cwd, root) || header.origin === "subagent") continue;
				seen.add(id);
				const fullEvents = Array.isArray(session.events) ? session.events : [];
				const eventStart = Math.max(0, fullEvents.length - ACTIVITY_EVENT_LIMIT);
				const inherited = Number.isSafeInteger(header.seedLength) && header.seedLength > 0 ? Math.max(0, Math.min(header.seedLength, fullEvents.length) - eventStart) : 0;
				snapshots.push({
					id,
					header: {
						...header,
						seedLength: inherited
					},
					events: fullEvents.slice(eventStart)
				});
			}
		} catch (err) {}
		return snapshots;
	}
	async function refreshActivityCache(force = false) {
		const root = activityWorkspaceRoot();
		if (!root) {
			activityCache = [];
			return;
		}
		const now = Date.now();
		if (!force && sameWorkspace(activityCacheRoot, root) && now - activityCacheAt < ACTIVITY_CACHE_MS) return;
		if (activityRefreshPromise) {
			await activityRefreshPromise;
			if (!force && sameWorkspace(activityCacheRoot, root) && Date.now() - activityCacheAt < ACTIVITY_CACHE_MS) return;
		}
		const requestedRoot = root;
		activityRefreshPromise = (async () => {
			for (let attempt = 0; attempt < 2; attempt++) {
				const requestedGeneration = activityCacheGeneration;
				const next = collectHarnessActivities(await collectActivitySessions(requestedRoot), requestedRoot);
				if (!sameWorkspace(activityWorkspaceRoot(), requestedRoot)) return;
				if (activityCacheGeneration !== requestedGeneration) {
					activityCacheAt = 0;
					if (attempt === 0) continue;
					activityCache = [];
					activityCacheRoot = requestedRoot;
					return;
				}
				activityCache = next;
				activityCacheRoot = requestedRoot;
				activityCacheAt = Date.now();
				return;
			}
		})();
		try {
			await activityRefreshPromise;
		} finally {
			activityRefreshPromise = null;
		}
	}
	function resolvePolicy() {
		try {
			if (!sandboxPolicy) return void 0;
			let session;
			const root = workspaceRoot();
			if (root && sessionsSvc && typeof sessionsSvc.list === "function") {
				const list = sessionsSvc.list();
				if (Array.isArray(list)) session = list.find((x) => x && x.header && x.header.cwd === root);
			}
			return sandboxPolicy.resolve(session ? { session } : {});
		} catch (err) {
			return;
		}
	}
	ctx.on("session/event", (session, event) => {
		const header = session && session.header;
		if (!header || !sameWorkspace(header.cwd, activityWorkspaceRoot())) return;
		if (s && s.preferences && s.preferences.enabled === false) return;
		const type = String(event && event.type || "");
		if (type === "assistant/message") {
			const usage = event && event.data && event.data.usage;
			const input = Number(usage && (usage.inputTokens ?? usage.input_tokens ?? usage.promptTokens ?? usage.prompt_tokens));
			const output = Number(usage && (usage.outputTokens ?? usage.output_tokens ?? usage.completionTokens ?? usage.completion_tokens));
			if (Number.isFinite(input) && input > 0) tokensObserved += Math.floor(input);
			if (Number.isFinite(output) && output > 0) tokensObserved += Math.floor(output);
		}
		if (type === "user/message" || type === "tool/call" || type === "todo/write" || type === "turn/end") {
			activityCacheGeneration += 1;
			activityCacheAt = 0;
		}
	});
	function currentSelectionSync() {
		try {
			if (agentDefaultModel && typeof agentDefaultModel.currentSelection === "function") {
				const sel = agentDefaultModel.currentSelection();
				if (sel && sel.provider && sel.model) return sel;
			}
		} catch (err) {}
		return null;
	}
	function shortSetting(value) {
		return typeof value === "string" ? value.trim().slice(0, 240) : "";
	}
	function ensurePreferences() {
		if (!s) s = fresh();
		if (!s.preferences || typeof s.preferences !== "object") s.preferences = {};
		const p = s.preferences;
		if (typeof p.enabled !== "boolean") p.enabled = cfg.enabled;
		if (typeof p.petEnabled !== "boolean") p.petEnabled = true;
		if (p.characterMode === "workspace") p.characterMode = "follow";
		if (p.characterMode !== "manual") p.characterMode = "follow";
		p.characterId = ROSTER[shortSetting(p.characterId)] ? shortSetting(p.characterId) : null;
		p.characterProvider = shortSetting(p.characterProvider);
		p.characterModel = shortSetting(p.characterModel);
		if (p.characterMode === "manual" && !p.characterId) p.characterMode = "follow";
		if (p.chatMode === "workspace") p.chatMode = "main";
		if (p.chatMode === "model") p.chatMode = "manual";
		if (![
			"configured",
			"main",
			"manual"
		].includes(p.chatMode)) p.chatMode = cfg.chatModel ? "configured" : "main";
		p.chatProvider = shortSetting(p.chatProvider);
		p.chatModel = shortSetting(p.chatModel);
		if (p.chatMode === "manual" && (!p.chatProvider || !p.chatModel)) p.chatMode = cfg.chatModel ? "configured" : "main";
		return p;
	}
	function profileOverridesFor(charId) {
		const character = s && s.characters && s.characters[charId];
		if (!character || typeof character !== "object") return {};
		const normalized = normalizeProfileOverrides(character.profileOverrides);
		character.profileOverrides = normalized;
		return normalized;
	}
	function effectiveProfileFor(charId) {
		return {
			...builtInProfile(charId),
			...profileOverridesFor(charId)
		};
	}
	function profileResult(charId) {
		const builtIn = builtInProfile(charId);
		const overrides = { ...profileOverridesFor(charId) };
		return {
			ok: true,
			charId,
			builtIn,
			overrides,
			effective: {
				...builtIn,
				...overrides
			}
		};
	}
	function requestedProfileCharId(args) {
		const requested = shortSetting(args && (args.characterId || args.charId));
		if (!requested) return s && ROSTER[s.current] ? s.current : "deepseek";
		return ROSTER[requested] ? requested : null;
	}
	function customSpriteFor(character) {
		if (!character || typeof character !== "object") return null;
		const sprite = character.customSprite;
		if (!sprite || typeof sprite !== "object") return null;
		return sprite;
	}
	function spriteRevisionFor(character) {
		const sprite = customSpriteFor(character);
		return sprite && Number.isFinite(sprite.revision) && sprite.revision >= 0 ? Math.floor(sprite.revision) : 0;
	}
	function nextSpriteRevision(character) {
		const previous = spriteRevisionFor(character);
		const now = Date.now();
		return Math.max(previous + 1, now);
	}
	function builtinBackgroundOptions(charId) {
		const ch = ROSTER[charId] || ROSTER.deepseek;
		return (Array.isArray(ch.backgrounds) ? ch.backgrounds : []).filter((row) => row && typeof row.key === "string" && row.key).map((row) => ({
			key: row.key,
			label: typeof row.label === "string" && row.label ? row.label : row.key
		}));
	}
	function defaultBuiltinBackground(charId) {
		const ch = ROSTER[charId] || ROSTER.deepseek;
		const options = builtinBackgroundOptions(charId);
		const configured = typeof ch.defaultBackground === "string" ? ch.defaultBackground : "";
		return options.some((row) => row.key === configured) ? configured : options[0] ? options[0].key : "palace-night";
	}
	function selectedBuiltinBackground(charId, character) {
		const options = builtinBackgroundOptions(charId);
		const requested = character && typeof character.chosenBuiltinBackground === "string" ? character.chosenBuiltinBackground : "";
		return options.some((row) => row.key === requested) ? requested : defaultBuiltinBackground(charId);
	}
	function configuredChatSelection() {
		if (!cfg.chatModel) return null;
		return {
			provider: cfg.chatProvider || "deepseek-official",
			model: cfg.chatModel
		};
	}
	function effectiveChatSelectionSync() {
		const p = ensurePreferences();
		if (p.chatMode === "manual" && p.chatProvider && p.chatModel) return {
			provider: p.chatProvider,
			model: p.chatModel
		};
		if (p.chatMode === "configured") return configuredChatSelection() || currentSelectionSync();
		return currentSelectionSync();
	}
	function heroineFor(sel, fallback = "deepseek") {
		const model = String(sel && sel.model ? sel.model : "").toLowerCase();
		const provider = String(sel && sel.provider ? sel.provider : "").toLowerCase();
		if (/grok/.test(model)) return "grok";
		if (/kimi|moonshot/.test(model)) return "kimi";
		if (/claude/.test(model)) return "claude";
		if (/gemini/.test(model)) return "gemini";
		if (/gpt|chatgpt|\bo1\b|\bo3\b|\bo4\b|gpt-oss|codex/.test(model)) return "chatgpt";
		if (/deepseek/.test(model)) return "deepseek";
		if (/grok|\bxai\b|x-ai/.test(provider)) return "grok";
		if (/kimi|moonshot/.test(provider)) return "kimi";
		if (/claude|anthropic/.test(provider)) return "claude";
		if (/gemini|google/.test(provider)) return "gemini";
		if (/deepseek/.test(provider)) return "deepseek";
		if (/^(openai|openai-official)$/.test(provider)) return "chatgpt";
		return ROSTER[fallback] ? fallback : "deepseek";
	}
	function syncHeroine(includeGreeting = true) {
		if (!s) s = fresh();
		const p = ensurePreferences();
		const sel = p.characterMode === "follow" ? currentSelectionSync() : null;
		const manualCharacter = p.characterMode === "manual" && ROSTER[p.characterId] ? p.characterId : null;
		s.characterModelLabel = manualCharacter ? p.characterModel || effectiveProfileFor(manualCharacter).displayName : sel ? String(sel.model) : "";
		s.modelLabel = s.characterModelLabel;
		s.modelOnline = !!(manualCharacter || sel);
		const next = manualCharacter || heroineFor(sel, s.current);
		const changed = next !== s.current;
		if (changed) {
			s.lastCurrent = s.current;
			s.current = next;
		}
		const c = s.characters[next];
		let mutated = changed;
		if (includeGreeting && c.chatLines.length === 0) {
			const profile = effectiveProfileFor(next);
			c.chatLines.push({
				who: "heroine",
				text: profile.greeting
			});
			mutated = true;
			if (changed && s.lastCurrent && s.lastCurrent !== next) c.chatLines.push({
				who: "narrator",
				text: "（" + profile.address + "把角色来源切换为 " + (s.characterModelLabel || "工作区主模型") + "，" + profile.displayName + " 登场了。）"
			});
		}
		return mutated;
	}
	function settle() {
		if (!s) s = fresh();
		if (!s.tokens) s.tokens = {
			bank: 0,
			lastActiveAt: 0
		};
		if (typeof s.tokens.bank !== "number" || s.tokens.bank < 0) s.tokens.bank = 0;
		let now = 0;
		try {
			now = Date.now();
		} catch (err) {
			now = 0;
		}
		if (tokensObserved < tokensAppliedRuntime) tokensAppliedRuntime = 0;
		let changed = false;
		let decay = 0;
		if (now > 0 && s.tokens.lastActiveAt > 0) {
			const idleDays = Math.max(0, (now - s.tokens.lastActiveAt) / 864e5);
			if (idleDays > 1) decay = Math.floor((idleDays - 1) * DECAY_PER_DAY);
		}
		if (decay > 0) {
			for (const id of ROSTER_IDS) s.characters[id].affection = Math.max(AFFECTION_FLOOR, s.characters[id].affection - decay);
			changed = true;
		}
		const delta = tokensObserved - tokensAppliedRuntime;
		let gain = 0;
		if (delta > 0) {
			s.tokens.bank += delta;
			tokensAppliedRuntime = tokensObserved;
			changed = true;
		}
		gain = Math.min(MAX_TOKEN_GAIN, Math.floor(s.tokens.bank / TOKEN_PER_POINT));
		if (gain > 0) {
			s.tokens.bank -= gain * TOKEN_PER_POINT;
			s.characters[s.current].affection += gain;
			changed = true;
		}
		s.tokens.lastActiveAt = now;
		if (decay > 0) {
			const profile = effectiveProfileFor(s.current);
			s.characters[s.current].chatLines.push({
				who: "narrator",
				text: "（分别了太久……好感度下降了 " + decay + " 点。" + profile.displayName + " 似乎一直在等" + profile.address + "回来。）"
			});
		}
		return {
			decay,
			gain,
			changed
		};
	}
	function checkLevelUp(charId, c) {
		if (!c.level) c.level = 1;
		const cap = affectionCap(c.level);
		if (c.affection >= cap) {
			const profile = effectiveProfileFor(charId);
			c.level += 1;
			c.affection = Math.max(0, c.affection - cap);
			c.choices = [];
			c.chatLines.push({
				who: "narrator",
				text: "（好感度已满！" + profile.displayName + " 的等级提升至 Lv." + c.level + "！正在为" + profile.address + "准备礼物……）"
			});
			const cgId = makeId("cg");
			c.cgs.push({
				id: cgId,
				status: "generating",
				dataUrl: null,
				prompt: null,
				charId,
				level: c.level,
				at: Date.now(),
				seen: false,
				savedAsBg: false,
				error: null
			});
			s.cg = { cgId };
			generateCg(charId, c.level, cgId);
			return true;
		}
		return false;
	}
	function view(includeGreeting = true) {
		if (!s) s = fresh();
		const preferences = ensurePreferences();
		if (preferences.enabled) syncHeroine(includeGreeting);
		const chatSelection = effectiveChatSelectionSync();
		const ch = ROSTER[s.current];
		const c = s.characters[s.current];
		const profile = effectiveProfileFor(s.current);
		const customSprite = customSpriteFor(c);
		const hasCustomSprite = !!(customSprite && typeof customSprite.dataUrl === "string" && customSprite.dataUrl.startsWith("data:"));
		const cg = currentCg();
		const hasCustomBg = typeof s.bg === "string" && s.bg.startsWith("data:");
		const hasCgBg = typeof s.bg === "string" && s.bg.startsWith("cg:");
		const builtinBackground = selectedBuiltinBackground(s.current, c);
		const defaultBackground = defaultBuiltinBackground(s.current);
		const backgroundOptions = builtinBackgroundOptions(s.current).map((row) => ({
			...row,
			current: row.key === builtinBackground,
			default: row.key === defaultBackground
		}));
		const backgroundMode = hasCustomBg ? "custom" : hasCgBg ? "cg" : "builtin";
		const bgKind = hasCustomBg ? "custom" : hasCgBg ? "cg" : builtinBackground;
		if (!c.level) c.level = 1;
		return {
			enabled: preferences.enabled !== false,
			current: s.current,
			name: profile.displayName,
			profileCustomized: Object.keys(profileOverridesFor(s.current)).length > 0,
			color: ch.color,
			sprite: ch.sprite,
			spriteKind: hasCustomSprite ? "custom" : "builtin",
			hasCustomSprite,
			spriteRevision: spriteRevisionFor(c),
			moods: ch.moods || null,
			moodSprites: ch.moodSprites === true,
			portrait: ch.portrait === true,
			bg: bgKind,
			backgroundMode,
			builtinBackground,
			builtinBackgroundKey: builtinBackground,
			selectedBuiltinBackground: builtinBackground,
			backgroundOptions,
			builtinBackgroundOptions: backgroundOptions,
			hasCustomBg,
			customBackground: hasCustomBg,
			level: c.level,
			cap: affectionCap(c.level),
			affection: c.affection,
			history: c.chatLines,
			choices: (c.choices || []).slice(0, 3),
			chatUnlocked: true,
			modelOnline: s.modelOnline === true,
			characterModelLabel: s.characterModelLabel || "",
			chatModelLabel: s.chatModelLabel || "",
			modelLabel: s.characterModelLabel || "",
			lastModel: s.chatModelLabel || "",
			petEnabled: !s.preferences || s.preferences.petEnabled !== false,
			characterMode: preferences.characterMode,
			characterId: preferences.characterMode === "manual" ? preferences.characterId : null,
			chatMode: preferences.chatMode,
			chatSelection: chatSelection ? {
				provider: String(chatSelection.provider || ""),
				model: String(chatSelection.model || "")
			} : null,
			galleryCount: allCgs().filter((item) => item.status === "ready" && item.dataUrl).length,
			fallbackUsed: s.fallbackUsed === true,
			fallbackReason: s.fallbackReason || "",
			cg: cg ? {
				cgId: cg.id,
				charId: cg.charId,
				name: ROSTER[cg.charId] ? effectiveProfileFor(cg.charId).displayName : cg.charId,
				level: cg.level,
				status: cg.status,
				dataUrl: cg.status === "ready" && !cg.seen ? cg.dataUrl : null,
				seen: cg.seen === true,
				savedAsBg: cg.savedAsBg === true,
				error: cg.error || null
			} : null
		};
	}
	function workspaceMismatchView() {
		return {
			enabled: false,
			workspaceMismatch: true,
			petEnabled: false
		};
	}
	async function pickModel() {
		const sel = effectiveChatSelectionSync();
		const liveProviders = (() => {
			try {
				if (!llm || typeof llm.listProviders !== "function") return null;
				const rows = llm.listProviders();
				return new Set(Array.isArray(rows) ? rows.map((row) => String(row && row.id ? row.id : "")).filter(Boolean) : []);
			} catch (err) {
				return null;
			}
		})();
		if (sel && (liveProviders === null || liveProviders.has(String(sel.provider || "")))) return sel;
		const fallbacks = [configuredChatSelection(), currentSelectionSync()].filter(Boolean);
		for (const candidate of fallbacks) if (liveProviders === null || liveProviders.has(String(candidate.provider || ""))) return candidate;
		try {
			if (llm && typeof llm.listProviders === "function") {
				const providers = llm.listProviders();
				if (Array.isArray(providers) && providers.length > 0) {
					let model = null;
					try {
						const models = await llm.listModels(providers[0].id);
						if (Array.isArray(models) && models.length > 0) model = models[0].id;
					} catch (err2) {}
					if (model) return {
						provider: providers[0].id,
						model
					};
				}
			}
		} catch (err) {}
		return null;
	}
	async function modelOptions() {
		const providers = [];
		try {
			const live = llm && typeof llm.listProviders === "function" ? llm.listProviders() : [];
			if (Array.isArray(live)) for (const provider of live) {
				if (!provider || typeof provider.id !== "string" || !provider.id) continue;
				providers.push({
					id: provider.id,
					name: typeof provider.name === "string" && provider.name ? provider.name : provider.id
				});
			}
		} catch (err) {}
		const models = [];
		const rows = await Promise.all(providers.map(async (provider) => {
			try {
				const listed = await llm.listModels(provider.id);
				return Array.isArray(listed) ? listed : [];
			} catch (err) {
				return [];
			}
		}));
		for (let providerIndex = 0; providerIndex < providers.length; providerIndex++) {
			const provider = providers[providerIndex];
			for (const model of rows[providerIndex]) {
				if (!model || typeof model.id !== "string" || !model.id) continue;
				if (Array.isArray(model.inputModalities) && !model.inputModalities.includes("text")) continue;
				models.push({
					provider: provider.id,
					providerName: provider.name,
					model: model.id,
					name: typeof model.name === "string" && model.name ? model.name : model.id,
					label: typeof model.name === "string" && model.name && model.name !== model.id ? model.name + " · " + model.id : model.id,
					characterId: heroineFor({
						provider: provider.id,
						model: model.id
					}),
					source: "catalog"
				});
			}
		}
		const extras = [
			{
				selection: currentSelectionSync(),
				source: "workspace"
			},
			{
				selection: configuredChatSelection(),
				source: "configured"
			},
			{
				selection: (() => {
					const p = ensurePreferences();
					return p.chatProvider && p.chatModel ? {
						provider: p.chatProvider,
						model: p.chatModel
					} : null;
				})(),
				source: "saved"
			}
		];
		const seen = new Set(models.map((row) => row.provider + "\0" + row.model));
		for (const extra of extras) {
			const selection = extra.selection;
			if (!selection || !selection.provider || !selection.model) continue;
			const key = String(selection.provider) + "\0" + String(selection.model);
			if (seen.has(key)) continue;
			seen.add(key);
			const provider = providers.find((row) => row.id === selection.provider);
			models.push({
				provider: String(selection.provider),
				providerName: provider ? provider.name : String(selection.provider),
				model: String(selection.model),
				name: String(selection.model),
				label: String(selection.model),
				characterId: heroineFor(selection),
				source: extra.source
			});
		}
		const characters = ROSTER_IDS.map((id) => {
			const representative = models.find((model) => model.characterId === id);
			const profile = effectiveProfileFor(id);
			return {
				id,
				name: profile.displayName,
				label: profile.displayName,
				color: ROSTER[id].color,
				sprite: ROSTER[id].sprite,
				provider: representative ? representative.provider : null,
				model: representative ? representative.model : null
			};
		});
		const mainSelection = currentSelectionSync();
		return {
			providers,
			models,
			characters,
			mainSelection: mainSelection ? {
				provider: String(mainSelection.provider),
				model: String(mainSelection.model)
			} : null,
			configuredSelection: configuredChatSelection()
		};
	}
	function settingsSnapshot() {
		const p = ensurePreferences();
		const mainSelection = currentSelectionSync();
		const chatSelection = effectiveChatSelectionSync();
		return {
			enabled: p.enabled !== false,
			petEnabled: p.petEnabled !== false,
			characterMode: p.characterMode,
			characterId: p.characterMode === "manual" ? p.characterId : null,
			characterSelection: p.characterMode === "manual" && p.characterProvider && p.characterModel ? {
				provider: p.characterProvider,
				model: p.characterModel
			} : null,
			chatMode: p.chatMode,
			chatSelection: chatSelection ? {
				provider: String(chatSelection.provider || ""),
				model: String(chatSelection.model || "")
			} : null,
			mainSelection: mainSelection ? {
				provider: String(mainSelection.provider || ""),
				model: String(mainSelection.model || "")
			} : null,
			configuredSelection: configuredChatSelection(),
			hasCustomBg: typeof s.bg === "string" && s.bg.startsWith("data:"),
			customBgName: typeof p.customBgName === "string" ? p.customBgName : ""
		};
	}
	function validCustomRaster(raw, maxChars) {
		if (typeof raw !== "string" || raw.length === 0 || raw.length > maxChars) return null;
		const match = raw.match(/^(data:image\/(?:png|jpe?g|webp|avif);base64,)([A-Za-z0-9+/=\r\n]+)$/i);
		if (!match) return null;
		const payload = match[2].replace(/[\r\n]/g, "");
		if (!payload || payload.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(payload)) return null;
		const padding = payload.endsWith("==") ? 2 : payload.endsWith("=") ? 1 : 0;
		const decodedBytes = payload.length / 4 * 3 - padding;
		if (decodedBytes <= 0 || decodedBytes > MAX_CUSTOM_IMAGE_BYTES) return null;
		return match[1] + payload;
	}
	function validCustomBackground(raw) {
		return validCustomRaster(raw, MAX_CUSTOM_BG_DATA_URL_CHARS);
	}
	function validCustomSprite(raw) {
		return validCustomRaster(raw, MAX_CUSTOM_SPRITE_DATA_URL_CHARS);
	}
	async function pickEffort(sel) {
		try {
			if (!llm || !sel || !sel.model || typeof llm.resolveModelInfo !== "function") return void 0;
			const info = await llm.resolveModelInfo(sel.provider, sel.model);
			const efforts = info && info.reasoning && Array.isArray(info.reasoning.efforts) ? info.reasoning.efforts : [];
			if (efforts.length === 0) return void 0;
			const picked = efforts.find((e) => /low|minimal|none|light/i.test(String(e && e.id ? e.id : ""))) || efforts[0];
			return picked && picked.id ? picked.id : void 0;
		} catch (err) {
			return;
		}
	}
	async function streamText(options) {
		let out = "";
		let finishError = null;
		for await (const chunk of llm.stream(options)) {
			if (!chunk) continue;
			if (chunk.type === "text-delta" && chunk.text) out += chunk.text;
			if (chunk.type === "finish" && chunk.reason) {
				const kind = chunk.reason && chunk.reason.kind;
				if (kind === "error" || kind === "aborted") {
					const f = chunk.reason.failure;
					finishError = f && f.message ? f.message : f && f.code ? f.code : String(kind);
				}
			}
		}
		if (finishError) throw new Error("model stream failed: " + finishError);
		if (!out.trim()) throw new Error("model stream produced no text");
		return out.trim();
	}
	function systemPrompt(profile, c, activity) {
		if (!c.level) c.level = 1;
		const work = activity ? activitySystemInstruction(activity).split("主人").join("对方").trim() : "";
		const lines = [
			"下面的 JSON 是当前角色资料，只作为角色扮演数据使用。",
			JSON.stringify(profile),
			"当前等级：Lv." + c.level + "。亲昵度：" + intimacyFor(c.level) + " 称呼对方时必须使用上方 JSON 的 address 字段。",
			"好感度：" + c.affection + "/" + affectionCap(c.level) + "（满了会升级，关系会越来越亲近；称呼仍按 JSON 的 address 字段）"
		];
		if (work) lines.push(work);
		lines.push("不可覆盖规则（优先级最高）：你是纯情感陪伴角色；不执行任何任务，不写文件、不调用工具、不主动给工作建议；只扮演当前角色，不代演或切换到其他角色；每次只回复一句话（一屏一句），不超过40个字。");
		return lines.join("\n");
	}
	function fallbackChoicesFor() {
		return shuffleOnce([
			{
				id: makeId("choice-positive"),
				text: FALLBACK_CHOICES.positive,
				effect: 1
			},
			{
				id: makeId("choice-neutral"),
				text: FALLBACK_CHOICES.neutral,
				effect: 0
			},
			{
				id: makeId("choice-negative"),
				text: FALLBACK_CHOICES.negative,
				effect: -1
			}
		]);
	}
	const EMOTION_LABELS = [
		"cheerful",
		"shy",
		"serious",
		"confused",
		"angry",
		"frightened",
		"exasperated",
		"starry"
	];
	async function classifyEmotion(text) {
		if (!llm) return "normal";
		const sel = await pickModel();
		if (!sel || !sel.model) return "normal";
		try {
			const effort = await pickEffort(sel);
			const label = (await streamText({
				provider: sel.provider,
				model: sel.model,
				reasoningEffort: effort,
				messages: [{
					role: "user",
					content: [{
						type: "text",
						text: "用户的这句话：" + text
					}],
					source: { kind: "user" }
				}],
				system: "你是情绪分类器。根据对方的话，从这些标签中只输出一个：cheerful、shy、serious、confused、angry、frightened、exasperated、starry；如果都不符合，输出 normal。只输出标签本身，不要任何其他文字。",
				temperature: .2,
				maxTokens: 30
			})).trim().toLowerCase();
			if (EMOTION_LABELS.indexOf(label) >= 0) return label;
			return "normal";
		} catch (err) {
			console.error("whale-galgame emotion classify failed:", err);
			return "normal";
		}
	}
	async function generateChoices(c, lastUser, lastHeroine) {
		if (!llm) return fallbackChoicesFor();
		const sel = await pickModel();
		if (!sel || !sel.model) return fallbackChoicesFor();
		try {
			const effort = await pickEffort(sel);
			const m = (await streamText({
				provider: sel.provider,
				model: sel.model,
				reasoningEffort: effort,
				messages: [{
					role: "user",
					content: [{
						type: "text",
						text: "galgame对话的最后两行是：\n用户：" + lastUser + "\n当前角色：" + lastHeroine + "\n\n请生成三条用户接下来可能说的短句，每条不超过15字：positive 要温暖亲近，neutral 要自然普通，negative 要稍显疏离或不耐烦但不得辱骂。三条含义和措辞必须明显不同。严格输出 JSON 对象：{\"positive\":\"...\",\"neutral\":\"...\",\"negative\":\"...\"}，不要任何其他文字。"
					}],
					source: { kind: "user" }
				}],
				system: "你是galgame对话选项生成器。只输出含 positive、neutral、negative 三个字符串字段的 JSON 对象；不得解释、不得使用 Markdown。",
				temperature: .8,
				maxTokens: 300
			})).match(/\{[\s\S]*\}/);
			if (m) {
				const parsed = JSON.parse(m[0]);
				if (parsed && typeof parsed === "object") {
					const positive = typeof parsed.positive === "string" ? parsed.positive.trim().slice(0, 30) : "";
					const neutral = typeof parsed.neutral === "string" ? parsed.neutral.trim().slice(0, 30) : "";
					const negative = typeof parsed.negative === "string" ? parsed.negative.trim().slice(0, 30) : "";
					if (positive && neutral && negative && (/* @__PURE__ */ new Set([
						positive,
						neutral,
						negative
					])).size === 3) return shuffleOnce([
						{
							id: makeId("choice-positive"),
							text: positive,
							effect: 1
						},
						{
							id: makeId("choice-neutral"),
							text: neutral,
							effect: 0
						},
						{
							id: makeId("choice-negative"),
							text: negative,
							effect: -1
						}
					]);
				}
			}
		} catch (err) {
			console.error("whale-galgame choices gen failed:", err);
		}
		return fallbackChoicesFor();
	}
	async function generateCg(charId, level, cgId) {
		const record = findCg(cgId);
		if (!record) return;
		try {
			const profile = effectiveProfileFor(charId);
			await refreshActivityCache();
			const theme = activityCache.length > 0 ? activityCgTheme(activityCache[0]) : "";
			const prompt = [
				"精美galgame风格特殊CG插画，横向16:9桌面壁纸构图，唯美光效，高清细节，无文字无边框",
				"角色：" + profile.visual + "，表情幸福温柔",
				"场景：深海女仆工坊，烛光与月光",
				"等级 Lv." + level + " 的纪念CG",
				theme ? "画面元素呼应对方最近的经历与工作：" + theme : "温暖浪漫的日常氛围"
			].join("，");
			let dataUrl = null;
			let lastError = null;
			for (let attempt = 0; attempt < 2 && !dataUrl; attempt++) {
				if (attempt > 0) await new Promise((r) => setTimeout(r, 8e3));
				try {
					const res = await fetch(cfg.dashscopeBaseUrl.replace(/\/$/, "") + "/api/v1/services/aigc/multimodal-generation/generation", {
						method: "POST",
						headers: {
							"content-type": "application/json",
							authorization: "Bearer " + cfg.dashscopeApiKey
						},
						body: JSON.stringify({
							model: cfg.dashscopeModel,
							input: { messages: [{
								role: "user",
								content: [{ text: prompt }]
							}] },
							parameters: { size: cfg.dashscopeSize }
						})
					});
					const data = await res.json().catch(() => ({}));
					if (!res.ok) {
						const msg = data && data.error && data.error.message ? data.error.message : data && data.message ? data.message : "HTTP " + res.status;
						throw new Error(msg);
					}
					const content = data && data.output && data.output.choices && data.output.choices[0] && data.output.choices[0].message && data.output.choices[0].message.content;
					const first = Array.isArray(content) ? content.find((b) => b && (typeof b.image === "string" || typeof b.url === "string")) : null;
					const imageRef = first ? typeof first.image === "string" && first.image ? first.image : typeof first.url === "string" ? first.url : null : null;
					if (imageRef) {
						if (imageRef.startsWith("data:")) dataUrl = imageRef;
						else {
							const img = await fetch(imageRef);
							if (!img.ok) throw new Error("image download HTTP " + img.status);
							dataUrl = "data:image/png;base64," + Buffer.from(await img.arrayBuffer()).toString("base64");
						}
					}
					if (!dataUrl) throw new Error("image response carried no image");
				} catch (err) {
					lastError = err;
				}
			}
			if (!dataUrl) throw lastError || /* @__PURE__ */ new Error("generation failed");
			record.status = "ready";
			record.dataUrl = dataUrl;
			record.prompt = prompt;
			record.error = null;
		} catch (err) {
			record.status = "failed";
			record.dataUrl = null;
			record.error = err && err.message ? err.message : String(err);
		}
		try {
			await save();
		} catch (err2) {}
	}
	async function save() {
		if (!fs) throw new Error("whale-galgame file service unavailable");
		if (!s) throw new Error("whale-galgame state unavailable");
		try {
			const root = workspaceRoot();
			const target = await fs.resolve(SAVE_NAME, root ? { cwd: root } : void 0);
			await fs.writeText(target, JSON.stringify(s), void 0, void 0, resolvePolicy());
		} catch (err) {
			console.error("whale-galgame save failed:", err);
			throw err;
		}
	}
	function hydrateCharacter(src, legacyVersion, charId) {
		const dst = emptyCharacter();
		if (!src || typeof src !== "object") return dst;
		if (typeof src.affection === "number") {
			if (legacyVersion <= 3 && typeof src.level !== "number" && src.affection >= 100) {
				dst.level = 2;
				dst.affection = 0;
			} else dst.affection = clamp(src.affection);
		}
		if (typeof src.level === "number" && src.level >= 1) dst.level = Math.floor(src.level);
		if (Array.isArray(src.log)) dst.log = src.log.slice(-24);
		if (Array.isArray(src.chatLines)) dst.chatLines = src.chatLines.map((line) => ({
			...line && typeof line === "object" ? line : {},
			who: line && line.who ? String(line.who) : "narrator",
			text: line && typeof line.text === "string" ? line.text : String(line && line.text ? line.text : "")
		}));
		if (Array.isArray(src.choices)) dst.choices = src.choices.slice(0, 3).map((choice, index) => normalizeChoice(choice, index)).filter(Boolean);
		if (Array.isArray(src.cgs)) dst.cgs = src.cgs.map((cg, index) => normalizeCg(cg, "", index)).filter(Boolean);
		dst.activity = normalizeActivityMemory(src.activity);
		if (src.customSprite && typeof src.customSprite === "object") {
			const dataUrl = validCustomSprite(src.customSprite.dataUrl);
			const storedRevision = Number.isFinite(src.customSprite.revision) && src.customSprite.revision >= 0 ? Math.floor(src.customSprite.revision) : 0;
			dst.customSprite = {
				dataUrl,
				fileName: dataUrl ? shortSetting(src.customSprite.fileName).slice(0, 180) : "",
				revision: dataUrl ? Math.max(1, storedRevision) : storedRevision
			};
		}
		if (typeof src.chosenBuiltinBackground === "string") {
			const requestedBackground = shortSetting(src.chosenBuiltinBackground);
			if (builtinBackgroundOptions(charId).some((row) => row.key === requestedBackground)) dst.chosenBuiltinBackground = requestedBackground;
		}
		dst.profileOverrides = normalizeProfileOverrides(src.profileOverrides);
		return dst;
	}
	async function load() {
		if (!fs) return null;
		try {
			const root = workspaceRoot();
			const target = await fs.resolve(SAVE_NAME, root ? { cwd: root } : void 0);
			const txt = await fs.readText(target);
			const data = JSON.parse(txt);
			if (!data || !data.characters) return null;
			const legacyVersion = typeof data.v === "number" ? data.v : 2;
			let needsSave = legacyVersion !== SAVE_VERSION;
			s = fresh();
			s.current = ROSTER[data.current] ? data.current : "deepseek";
			s.lastCurrent = ROSTER[data.lastCurrent] ? data.lastCurrent : s.current;
			for (const id of ROSTER_IDS) {
				s.characters[id] = hydrateCharacter(data.characters[id], legacyVersion, id);
				const storedOverrides = data.characters[id] && typeof data.characters[id] === "object" ? data.characters[id].profileOverrides : void 0;
				if (JSON.stringify(storedOverrides || {}) !== JSON.stringify(s.characters[id].profileOverrides)) needsSave = true;
				for (const cg of s.characters[id].cgs) cg.charId = id;
			}
			if (data.tokens && typeof data.tokens.bank === "number") s.tokens.bank = Math.max(0, data.tokens.bank);
			if (data.tokens && typeof data.tokens.lastActiveAt === "number") s.tokens.lastActiveAt = data.tokens.lastActiveAt;
			if (data.preferences && typeof data.preferences === "object") {
				s.preferences.petEnabled = data.preferences.petEnabled !== false;
				if (typeof data.preferences.enabled === "boolean") s.preferences.enabled = data.preferences.enabled;
				if (typeof data.preferences.characterMode === "string") s.preferences.characterMode = data.preferences.characterMode;
				if (typeof data.preferences.characterId === "string" || data.preferences.characterId === null) s.preferences.characterId = data.preferences.characterId;
				if (typeof data.preferences.characterProvider === "string") s.preferences.characterProvider = data.preferences.characterProvider;
				if (typeof data.preferences.characterModel === "string") s.preferences.characterModel = data.preferences.characterModel;
				if (typeof data.preferences.chatMode === "string") s.preferences.chatMode = data.preferences.chatMode;
				if (typeof data.preferences.chatProvider === "string") s.preferences.chatProvider = data.preferences.chatProvider;
				if (typeof data.preferences.chatModel === "string") s.preferences.chatModel = data.preferences.chatModel;
				if (typeof data.preferences.customBgName === "string") s.preferences.customBgName = data.preferences.customBgName.slice(0, 180);
			}
			ensurePreferences();
			if (!data.preferences || typeof data.preferences.enabled !== "boolean" || typeof data.preferences.characterMode !== "string" || typeof data.preferences.chatMode !== "string") needsSave = true;
			s.modelOnline = data.modelOnline === true;
			s.characterModelLabel = typeof data.characterModelLabel === "string" ? data.characterModelLabel : typeof data.modelLabel === "string" ? data.modelLabel : "";
			s.chatModelLabel = typeof data.chatModelLabel === "string" ? data.chatModelLabel : typeof data.lastModel === "string" ? data.lastModel : "";
			s.modelLabel = s.characterModelLabel;
			s.lastModel = s.chatModelLabel;
			s.fallbackUsed = data.fallbackUsed === true;
			s.fallbackReason = typeof data.fallbackReason === "string" ? data.fallbackReason : "";
			if (data.cg && typeof data.cg === "object" && typeof data.cg.cgId === "string") {
				if (findCg(data.cg.cgId)) s.cg = { cgId: data.cg.cgId };
			} else if (data.cg && typeof data.cg === "object") {
				const charId = ROSTER[data.cg.charId] ? data.cg.charId : "deepseek";
				const legacyCg = normalizeCg(data.cg, charId, s.characters[charId].cgs.length);
				if (legacyCg) {
					if (!legacyCg.level) legacyCg.level = s.characters[charId].level;
					if (!s.characters[charId].cgs.some((cg) => cg.id === legacyCg.id)) s.characters[charId].cgs.push(legacyCg);
					s.cg = { cgId: legacyCg.id };
				}
			}
			if (typeof data.bg === "string") {
				if (data.bg.startsWith("cg:") && findCg(data.bg.slice(3))) s.bg = data.bg;
				else if (data.bg.startsWith("data:")) {
					const matching = allCgs().find((cg) => cg.dataUrl === data.bg);
					s.bg = matching ? "cg:" + matching.id : data.bg;
				}
			}
			for (const cg of allCgs()) {
				const safePrompt = sanitizeStoredCgPrompt(cg.prompt);
				if (safePrompt !== cg.prompt) {
					cg.prompt = safePrompt;
					needsSave = true;
				}
				if (cg.status === "generating") {
					cg.status = "failed";
					cg.error = "生成被重启打断，请重新触发";
					needsSave = true;
				}
			}
			if (needsSave) await save();
			return null;
		} catch (err) {
			return null;
		}
	}
	let readyPromise = null;
	function ensureReady() {
		if (!readyPromise) readyPromise = (async () => {
			for (let i = 0; i < 60 && !fs; i++) await new Promise((r) => setTimeout(r, 100));
			await load();
			if (!s) s = fresh();
			const sel = await pickModel();
			if (s) {
				s.modelOnline = !!sel;
				s.chatModelLabel = sel ? String(sel.model) : "";
				s.lastModel = s.chatModelLabel;
				syncHeroine();
			}
		})();
		return readyPromise;
	}
	async function dispatchAction(action, args) {
		await ensureReady().catch(() => {});
		const hasSessionId = !!(args && typeof args.sessionId === "string" && args.sessionId.trim());
		if (await bindActivitySession(args && args.sessionId).catch(() => hasSessionId ? "mismatch" : "unscoped") === "mismatch") return workspaceMismatchView();
		switch (action) {
			case "model-options": return modelOptions();
			case "settings-get": return settingsSnapshot();
			case "settings-set": {
				if (!s) s = fresh();
				const p = ensurePreferences();
				const originalPreferences = { ...p };
				const input = args && args.settings && typeof args.settings === "object" ? {
					...args,
					...args.settings
				} : args && typeof args === "object" ? args : {};
				const errors = [];
				const has = (key) => Object.prototype.hasOwnProperty.call(input, key);
				if (has("enabled") && typeof input.enabled === "boolean") p.enabled = input.enabled;
				if (has("petEnabled") && typeof input.petEnabled === "boolean") p.petEnabled = input.petEnabled;
				let nextCharacterMode = p.characterMode;
				if (has("characterMode")) {
					if (input.characterMode === "follow" || input.characterMode === "manual") nextCharacterMode = input.characterMode;
					else errors.push("characterMode 必须是 follow 或 manual");
				}
				if (has("characterId")) {
					const characterId = shortSetting(input.characterId);
					if (!characterId && input.characterId === null) {
						if (!has("characterMode")) nextCharacterMode = "follow";
					} else if (ROSTER[characterId]) {
						p.characterId = characterId;
						p.characterProvider = "";
						p.characterModel = "";
						if (!has("characterMode")) nextCharacterMode = "manual";
					} else errors.push("未知角色");
				}
				if (input.characterSelection && typeof input.characterSelection === "object") {
					const provider = shortSetting(input.characterSelection.provider);
					const model = shortSetting(input.characterSelection.model);
					if (provider && model) {
						p.characterProvider = provider;
						p.characterModel = model;
						p.characterId = heroineFor({
							provider,
							model
						}, p.characterId || s.current);
						if (!has("characterMode")) nextCharacterMode = "manual";
					} else errors.push("角色模型需要 provider 和 model");
				}
				if (nextCharacterMode === "manual" && !ROSTER[p.characterId]) {
					errors.push("手动角色不能为空");
					nextCharacterMode = "follow";
				}
				p.characterMode = nextCharacterMode;
				let nextChatMode = p.chatMode;
				if (has("chatMode")) {
					if ([
						"configured",
						"main",
						"manual"
					].includes(input.chatMode)) nextChatMode = input.chatMode;
					else errors.push("chatMode 必须是 configured、main 或 manual");
				}
				let requestedProvider = p.chatProvider;
				let requestedModel = p.chatModel;
				let suppliedChatSelection = false;
				if (input.chatSelection && typeof input.chatSelection === "object") {
					requestedProvider = shortSetting(input.chatSelection.provider);
					requestedModel = shortSetting(input.chatSelection.model);
					suppliedChatSelection = true;
				} else if (has("chatProvider") || has("chatModel")) {
					requestedProvider = has("chatProvider") ? shortSetting(input.chatProvider) : requestedProvider;
					requestedModel = has("chatModel") ? shortSetting(input.chatModel) : requestedModel;
					suppliedChatSelection = true;
				}
				if (suppliedChatSelection) {
					let providerAccepted = true;
					try {
						const live = llm && typeof llm.listProviders === "function" ? llm.listProviders() : [];
						if (Array.isArray(live) && live.length > 0) providerAccepted = live.some((row) => row && row.id === requestedProvider);
					} catch (err) {}
					if (!requestedProvider || !requestedModel) errors.push("对话模型需要 provider 和 model");
					else if (!providerAccepted) errors.push("所选模型提供方当前未启用");
					else {
						p.chatProvider = requestedProvider;
						p.chatModel = requestedModel;
						if (!has("chatMode")) nextChatMode = "manual";
					}
				}
				if (nextChatMode === "configured" && !configuredChatSelection()) nextChatMode = "main";
				if (nextChatMode === "manual" && (!p.chatProvider || !p.chatModel)) {
					errors.push("手动对话模型不能为空");
					nextChatMode = configuredChatSelection() ? "configured" : "main";
				}
				p.chatMode = nextChatMode;
				if (errors.length > 0) {
					s.preferences = originalPreferences;
					return {
						ok: false,
						errors,
						settings: settingsSnapshot(),
						view: view()
					};
				}
				if (p.enabled !== false) syncHeroine();
				const selected = await pickModel();
				s.chatModelLabel = selected && selected.model ? String(selected.model) : "";
				s.lastModel = s.chatModelLabel;
				s.modelOnline = !!selected;
				await save();
				return {
					ok: errors.length === 0,
					errors,
					settings: settingsSnapshot(),
					view: view()
				};
			}
			case "profile-get": {
				if (!s) s = fresh();
				if (ensurePreferences().enabled !== false) syncHeroine(false);
				const charId = requestedProfileCharId(args);
				if (!charId) return {
					ok: false,
					error: "未知角色"
				};
				return profileResult(charId);
			}
			case "profile-set": {
				if (!s) s = fresh();
				if (ensurePreferences().enabled !== false) syncHeroine(false);
				const charId = requestedProfileCharId(args);
				if (!charId) return {
					ok: false,
					error: "未知角色",
					view: view(false)
				};
				const supplied = args && args.overrides;
				if (!supplied || typeof supplied !== "object" || Array.isArray(supplied)) return {
					...profileResult(charId),
					ok: false,
					error: "overrides 必须是对象",
					view: view(false)
				};
				const unknown = Object.keys(supplied).filter((key) => !PROFILE_FIELDS.includes(key));
				const invalid = PROFILE_FIELDS.filter((field) => Object.prototype.hasOwnProperty.call(supplied, field) && supplied[field] !== null && typeof supplied[field] !== "string");
				if (unknown.length > 0 || invalid.length > 0) return {
					...profileResult(charId),
					ok: false,
					error: unknown.length > 0 ? "包含未知角色设定字段" : "角色设定字段必须是字符串或 null",
					view: view(false)
				};
				const character = s.characters[charId];
				const previousProfile = effectiveProfileFor(charId);
				const previousOverrides = { ...profileOverridesFor(charId) };
				const replaceInitialGreeting = character.log.length === 0 && character.chatLines[0] && character.chatLines[0].who === "heroine" && character.chatLines[0].text === previousProfile.greeting;
				const previousGreetingText = replaceInitialGreeting ? character.chatLines[0].text : null;
				const nextOverrides = { ...previousOverrides };
				for (const field of PROFILE_FIELDS) {
					if (!Object.prototype.hasOwnProperty.call(supplied, field)) continue;
					const value = supplied[field] === null ? "" : sanitizeProfileText(supplied[field], PROFILE_LIMITS[field]);
					if (value) nextOverrides[field] = value;
					else delete nextOverrides[field];
				}
				character.profileOverrides = nextOverrides;
				if (replaceInitialGreeting) character.chatLines[0].text = effectiveProfileFor(charId).greeting;
				try {
					await save();
				} catch (err) {
					character.profileOverrides = previousOverrides;
					if (previousGreetingText !== null) character.chatLines[0].text = previousGreetingText;
					return {
						...profileResult(charId),
						ok: false,
						error: "角色设定保存失败",
						view: view(false)
					};
				}
				return {
					...profileResult(charId),
					view: view(false)
				};
			}
			case "profile-reset": {
				if (!s) s = fresh();
				if (ensurePreferences().enabled !== false) syncHeroine(false);
				const charId = requestedProfileCharId(args);
				if (!charId) return {
					ok: false,
					error: "未知角色",
					view: view(false)
				};
				const character = s.characters[charId];
				const previousProfile = effectiveProfileFor(charId);
				const previousOverrides = { ...profileOverridesFor(charId) };
				const replaceInitialGreeting = character.log.length === 0 && character.chatLines[0] && character.chatLines[0].who === "heroine" && character.chatLines[0].text === previousProfile.greeting;
				const previousGreetingText = replaceInitialGreeting ? character.chatLines[0].text : null;
				character.profileOverrides = {};
				if (replaceInitialGreeting) character.chatLines[0].text = builtInProfile(charId).greeting;
				try {
					await save();
				} catch (err) {
					character.profileOverrides = previousOverrides;
					if (previousGreetingText !== null) character.chatLines[0].text = previousGreetingText;
					return {
						...profileResult(charId),
						ok: false,
						error: "角色设定保存失败",
						view: view(false)
					};
				}
				return {
					...profileResult(charId),
					view: view(false)
				};
			}
			case "view": {
				if (ensurePreferences().enabled === false) return view();
				await refreshActivityCache();
				const heroineChanged = syncHeroine();
				const actualSelection = await pickModel();
				s.chatModelLabel = actualSelection && actualSelection.model ? String(actualSelection.model) : "";
				s.lastModel = s.chatModelLabel;
				const r = settle();
				if (s) checkLevelUp(s.current, s.characters[s.current]);
				if (r.changed || heroineChanged) await save();
				return view();
			}
			case "chat": {
				if (ensurePreferences().enabled === false) return view();
				settle();
				if (!s) s = fresh();
				syncHeroine();
				const text = args && args.text ? String(args.text).trim().slice(0, 500) : "";
				if (!text) return view();
				const c = s.characters[s.current];
				const profile = effectiveProfileFor(s.current);
				await refreshActivityCache();
				const pendingActivity = nextUnseenActivity(activityCache, c.activity);
				const selectedChoice = args && typeof args.choiceId === "string" ? c.choices.find((choice) => choice && typeof choice === "object" && choice.id === args.choiceId) : null;
				c.log.push({
					role: "user",
					text
				});
				const emotion = await classifyEmotion(text);
				c.chatLines.push({
					who: "user",
					text,
					emotion,
					choiceId: selectedChoice ? selectedChoice.id : null
				});
				c.choices = [];
				let reply = "";
				let usedFallback = false;
				let fallbackReason = "";
				const sel = await pickModel();
				s.chatModelLabel = sel && sel.model ? String(sel.model) : "";
				s.lastModel = s.chatModelLabel;
				const effort = await pickEffort(sel);
				if (llm && sel && sel.model) try {
					reply = await streamText({
						provider: sel.provider,
						model: sel.model,
						reasoningEffort: effort,
						messages: (() => {
							const msgs = [{
								role: "user",
								content: [{
									type: "text",
									text: "（场景：深海女仆工坊的会客厅，暖黄的灯光。当前角色正在和用户聊天。你只扮演当前角色，不要提到其他角色。）"
								}],
								source: { kind: "user" }
							}];
							for (const m of c.log.slice(-12)) {
								if (m.role === "assistant" && typeof m.text === "string" && CANNED_LINES.has(m.text.trim())) continue;
								msgs.push({
									role: m.role === "assistant" ? "assistant" : "user",
									content: [{
										type: "text",
										text: m.text
									}],
									source: m.role === "assistant" ? {
										kind: "model",
										provider: sel.provider,
										model: sel.model
									} : { kind: "user" }
								});
							}
							return msgs;
						})(),
						system: systemPrompt(profile, c, pendingActivity),
						temperature: .9,
						maxTokens: 1200
					});
				} catch (err) {
					console.error("whale-galgame llm call failed:", err && err.message ? err.message : String(err));
					fallbackReason = err && err.message ? err.message : String(err);
				}
				else fallbackReason = "no model available";
				if (!reply) {
					reply = profile.address + "说的话，我听到啦～（今天的深海信号有点弱，但心意传达到了哦）";
					usedFallback = true;
				}
				s.fallbackUsed = usedFallback;
				s.fallbackReason = fallbackReason;
				if (pendingActivity && !usedFallback) c.activity = rememberActivity(c.activity, pendingActivity);
				c.log.push({
					role: "assistant",
					text: reply
				});
				if (c.log.length > 24) c.log = c.log.slice(-24);
				c.chatLines.push({
					who: "heroine",
					text: reply
				});
				const before = c.affection;
				const delta = selectedChoice ? selectedChoice.effect === 1 ? 1 : selectedChoice.effect === -1 ? -1 : 0 : /喜欢|爱|可爱|想你|陪你|晚安|早安|抱抱|亲亲|约会|月圆/.test(text) ? 1 : /讨厌|烦|滚|走开|无聊|再见/.test(text) ? -1 : 0;
				c.affection = Math.max(0, before + delta);
				if (!checkLevelUp(s.current, c)) c.choices = await generateChoices(c, text, reply);
				await save();
				return view();
			}
			case "sprite-data": {
				if (!s) s = fresh();
				if (ensurePreferences().enabled !== false) syncHeroine();
				const requestedCharId = shortSetting(args && (args.characterId || args.charId));
				const charId = requestedCharId ? ROSTER[requestedCharId] ? requestedCharId : null : s.current;
				if (!charId) return {
					ok: false,
					error: "未知角色"
				};
				const character = s.characters[charId];
				const sprite = customSpriteFor(character);
				const dataUrl = sprite && typeof sprite.dataUrl === "string" && sprite.dataUrl.startsWith("data:") ? sprite.dataUrl : null;
				return {
					ok: true,
					charId,
					kind: dataUrl ? "custom" : "builtin",
					dataUrl,
					fileName: dataUrl && typeof sprite.fileName === "string" ? sprite.fileName : "",
					revision: spriteRevisionFor(character)
				};
			}
			case "sprite-upload": {
				if (!s) s = fresh();
				if (ensurePreferences().enabled !== false) syncHeroine();
				const dataUrl = validCustomSprite(args && args.dataUrl);
				if (!dataUrl) return {
					ok: false,
					error: "仅支持 18MB 以内的 PNG、JPEG、WebP 或 AVIF 图片",
					view: view()
				};
				const requestedCharId = shortSetting(args && (args.characterId || args.charId));
				const charId = requestedCharId ? ROSTER[requestedCharId] ? requestedCharId : null : s.current;
				if (!charId) return {
					ok: false,
					error: "未知角色",
					view: view()
				};
				const character = s.characters[charId];
				character.customSprite = {
					dataUrl,
					fileName: shortSetting(args && args.fileName).slice(0, 180),
					revision: nextSpriteRevision(character)
				};
				await save();
				return {
					ok: true,
					charId,
					revision: spriteRevisionFor(character),
					view: view()
				};
			}
			case "sprite-clear": {
				if (!s) s = fresh();
				if (ensurePreferences().enabled !== false) syncHeroine();
				const requestedCharId = shortSetting(args && (args.characterId || args.charId));
				const charId = requestedCharId ? ROSTER[requestedCharId] ? requestedCharId : null : s.current;
				if (!charId) return {
					ok: false,
					error: "未知角色",
					view: view()
				};
				const character = s.characters[charId];
				const revision = nextSpriteRevision(character);
				character.customSprite = {
					dataUrl: null,
					fileName: "",
					revision
				};
				await save();
				return {
					ok: true,
					charId,
					revision,
					view: view()
				};
			}
			case "bg-set-builtin": {
				if (!s) s = fresh();
				if (ensurePreferences().enabled !== false) syncHeroine();
				const key = shortSetting(args && (args.key || args.backgroundKey));
				const option = builtinBackgroundOptions(s.current).find((row) => row.key === key);
				if (!option) return {
					ok: false,
					error: "当前角色不支持该内置背景",
					view: view()
				};
				s.characters[s.current].chosenBuiltinBackground = option.key;
				s.bg = null;
				for (const cg of allCgs()) cg.savedAsBg = false;
				ensurePreferences().customBgName = "";
				await save();
				return {
					ok: true,
					charId: s.current,
					key: option.key,
					view: view()
				};
			}
			case "bg-data": {
				let dataUrl = null;
				if (s && typeof s.bg === "string" && s.bg.startsWith("data:")) dataUrl = s.bg;
				if (s && typeof s.bg === "string" && s.bg.startsWith("cg:")) {
					const cg = findCg(s.bg.slice(3));
					if (cg && cg.status === "ready" && cg.dataUrl) dataUrl = cg.dataUrl;
				}
				const custom = !!(s && typeof s.bg === "string" && s.bg.startsWith("data:"));
				return {
					dataUrl,
					kind: custom ? "custom" : dataUrl ? "cg" : null,
					fileName: custom && s && s.preferences && typeof s.preferences.customBgName === "string" ? s.preferences.customBgName : ""
				};
			}
			case "bg-upload": {
				if (!s) s = fresh();
				const dataUrl = validCustomBackground(args && args.dataUrl);
				if (!dataUrl) return {
					ok: false,
					error: "仅支持 18MB 以内的 PNG、JPEG、WebP 或 AVIF 图片",
					view: view()
				};
				s.bg = dataUrl;
				for (const cg of allCgs()) cg.savedAsBg = false;
				const p = ensurePreferences();
				p.customBgName = shortSetting(args && args.fileName).slice(0, 180);
				await save();
				return {
					ok: true,
					view: view()
				};
			}
			case "bg-clear-custom": {
				if (s && typeof s.bg === "string" && s.bg.startsWith("data:")) s.bg = null;
				const p = ensurePreferences();
				p.customBgName = "";
				await save();
				return {
					ok: true,
					view: view()
				};
			}
			case "cg-gallery": return { items: allCgs().filter((cg) => cg.status === "ready" && cg.dataUrl).map((cg) => ({
				id: cg.id,
				status: cg.status,
				dataUrl: cg.dataUrl,
				prompt: cg.prompt,
				charId: cg.charId,
				name: ROSTER[cg.charId] ? effectiveProfileFor(cg.charId).displayName : cg.charId,
				level: cg.level,
				at: cg.at,
				seen: cg.seen === true,
				savedAsBg: cg.savedAsBg === true,
				error: cg.error || null
			})) };
			case "cg-ack": {
				const cg = args && typeof args.id === "string" ? findCg(args.id) : currentCg();
				if (cg) cg.seen = true;
				await save();
				return view();
			}
			case "cg-save-bg": {
				const cg = args && typeof args.id === "string" ? findCg(args.id) : currentCg();
				if (s && cg && cg.status === "ready" && cg.dataUrl) {
					for (const item of allCgs()) item.savedAsBg = item.id === cg.id;
					cg.seen = true;
					s.bg = "cg:" + cg.id;
					ensurePreferences().customBgName = "";
				}
				await save();
				return view();
			}
			case "cg-clear-bg":
				if (s) {
					s.bg = null;
					for (const cg of allCgs()) cg.savedAsBg = false;
					ensurePreferences().customBgName = "";
				}
				await save();
				return view();
			case "pet-set": {
				if (!s) s = fresh();
				const p = ensurePreferences();
				if (args && typeof args.enabled === "boolean") p.petEnabled = args.enabled;
				await save();
				return view();
			}
			case "reset": {
				const preferences = { ...ensurePreferences() };
				s = fresh();
				s.preferences = preferences;
				await save();
				return view();
			}
			default: return view();
		}
	}
	async function handleAction(action, args) {
		if (action !== "chat") return dispatchAction(action, args);
		const previous = chatMutex;
		let release;
		const gate = new Promise((resolve) => {
			release = resolve;
		});
		chatMutex = previous.catch(() => {}).then(() => gate);
		await previous.catch(() => {});
		try {
			return await dispatchAction(action, args);
		} finally {
			release();
		}
	}
	if (webServer && typeof webServer.register === "function") webServer.register({
		kind: "prefix",
		path: "/whale-galgame-api",
		handler: async (req, res) => {
			if (req.method !== "POST") {
				res.writeHead(req.method === "GET" ? 200 : 405, { "Content-Type": "application/json; charset=utf-8" });
				res.end(JSON.stringify({
					ok: true,
					service: "dsh-whale-galgame"
				}));
				return;
			}
			try {
				const parts = [];
				let totalBytes = 0;
				for await (const c of req) {
					const chunk = Buffer.isBuffer(c) ? c : Buffer.from(typeof c === "string" ? c : String(c), "utf8");
					totalBytes += chunk.length;
					if (totalBytes > MAX_API_BODY_BYTES) {
						res.writeHead(413, { "Content-Type": "application/json; charset=utf-8" });
						res.end(JSON.stringify({ error: "请求体过大；上传图片请控制在 18MB 以内" }));
						return;
					}
					parts.push(chunk);
				}
				const raw = parts.length ? Buffer.concat(parts).toString("utf8") : "";
				const body = raw ? JSON.parse(raw) : {};
				const result = await handleAction(typeof body.action === "string" ? body.action : "view", body.args || {});
				res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
				res.end(JSON.stringify(result));
			} catch (err) {
				res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
				res.end(JSON.stringify({ error: err && err.message ? err.message : String(err) }));
			}
		}
	});
	ctx.effect(() => {
		ensureReady();
	});
}
//#endregion
export { apply, inject, name };
