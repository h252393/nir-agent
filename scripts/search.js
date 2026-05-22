   const axios = require('axios');
   const fs = require('fs');
   const path = require('path');

   // ==================== 配置区 ====================
   const SEARCH_QUERIES = [
     '近红外光谱 农产品检测',
     '近红外光谱仪 模型',
     'NIRS 农产品',
     '近红外 光谱 预处理',
     '近红外光谱 谷物 蛋白质',
     '近红外光谱 水果 糖度',
     '近红外光谱 调味品 成分'
   ];
   const MAX_RESULTS_PER_QUERY = 5;
   const TARGET_SOURCES = [
     '仪器信息网',
     '赛默飞官网',
     '布鲁克官网',
     'FOSS官网',
     '步琦官网',
     '聚光科技官网',
     '知网',
     '高校学报'
   ];
   const LATEST_FILE = path.join(__dirname, '..', 'data', 'latest.md'); // 每日汇总文件

   // ==================== 工具函数 ====================
   async function fetchUrl(url) {
     try {
       const response = await axios.get(url, {
         headers: { 'User-Agent': 'NIR-Agent/1.0 (mailto:research@example.com)' },
         timeout: 30000
       });
       return response.data;
     } catch (error) {
       console.error(`获取URL失败: ${url}`, error.message);
       return null;
     }
   }

   // 简单提取HTML中的纯文本（移除标签）
   function extractText(html) {
     if (!html) return '';
     return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
   }

   // 从文本中提取关键信息（基于关键词匹配）
   function extractInfo(title, source, date, content) {
     const info = {
       title: title || '未提及',
       source: source || '未提及',
       date: date || '未提及',
       application: '未提及',
       theme: '未提及',
       researchFocus: '未提及',
       techMethod: '未提及',
       innovation: '未提及',
       link: '未提及',
       notes: '未提及'
     };
     
     // 关键词匹配（实际可根据需求调整）
     if (content.includes('PLSR') || content.includes('偏最小二乘回归')) info.techMethod = 'PLSR';
     if (content.includes('SNV') || content.includes('标准正态变量变换')) info.techMethod = 'SNV';
     if (content.includes('农产品') || content.includes('谷物') || content.includes('水果')) info.application = '农产品';
     if (content.includes('模型') || content.includes('预测')) info.theme = '模型构建';
     if (content.includes('创新') || content.includes('改进')) info.innovation = '技术改进';
     
     return info;
   }

   // 生成Markdown表格
   function generateMarkdownTable(data) {
     let table = `# 近红外光谱与农产品检测每日动态\n\n`;
     table += `> 更新时间：${new Date().toLocaleDateString('zh-CN')}\n\n`;
     table += `| 序号 | 来源 | 发布时间 | 标题 | 应用对象 | 主题 | 研究重点 | 技术方法 | 创新 | 链接 | 备注 |\n`;
     table += `|:----:|:----|:--------|:----|:--------|:----|:--------|:--------|:----|:----|:----|\n`;
     data.forEach((item, index) => {
       table += `| ${index + 1} | ${item.source} | ${item.date} | ${item.title} | ${item.application} | ${item.theme} | ${item.researchFocus} | ${item.techMethod} | ${item.innovation} | ${item.link} | ${item.notes} |\n`;
     });
     return table;
   }

   // ==================== 主函数 ====================
   async function main() {
     const today = new Date().toLocaleDateString('zh-CN');
     console.log(`\n=== 开始搜集：${today} ===\n`);
     fs.mkdirSync(path.dirname(LATEST_FILE), { recursive: true });

     let allData = [];
     
// ==================== 配置区 ====================
const RSS_FEED_URL = 'https://www.instrument.com.cn/rss/news.xml'; // 仪器信息网RSS feed（示例，可替换为其他源）

// ==================== 主函数 ====================
async function main() {
  const today = new Date().toLocaleDateString('zh-CN');
  console.log(`\n=== 开始搜集：${today} ===\n`);
  fs.mkdirSync(path.dirname(LATEST_FILE), { recursive: true });

  let allData = [];

  try {
    // 获取RSS feed内容
    const response = await axios.get(RSS_FEED_URL, {
      headers: { 'User-Agent': 'NIR-Agent/1.0' },
      timeout: 30000
    });
    const rssContent = response.data;

    // 简单解析RSS（提取title、link、pubDate）
    const titles = rssContent.match(/<title>(.*?)<\/title>/g) || [];
    const links = rssContent.match(/<link>(.*?)<\/link>/g) || [];
    const dates = rssContent.match(/<pubDate>(.*?)<\/pubDate>/g) || [];

    // 提取前5条数据
    for (let i = 0; i < Math.min(5, titles.length); i++) {
      const title = titles[i]?.replace(/<title>/g, '').replace(/<\/title>/g, '').trim() || '未提及';
      const link = links[i]?.replace(/<link>/g, '').replace(/<\/link>/g, '').trim() || '未提及';
      const date = dates[i]?.replace(/<pubDate>/g, '').replace(/<\/pubDate>/g, '').trim() || '未提及';

      console.log(`处理：${title}`);
      const content = await fetchUrl(link);
      if (!content) continue;

      const textContent = extractText(content);
      const info = extractInfo(title, '仪器信息网', date, textContent);
      allData.push(info);
      await new Promise(resolve => setTimeout(resolve, 2000)); // 避免请求过快
    }
  } catch (error) {
    console.error('RSS feed获取失败:', error.message);
  }

  const markdown = generateMarkdownTable(allData);
  fs.writeFileSync(LATEST_FILE, markdown, 'utf-8');
  console.log(`已生成汇总文件：${LATEST_FILE}`);

  await uploadToCoze(LATEST_FILE);
}


     for (const result of mockResults) {
       console.log(`处理：${result.title}`);
       const content = await fetchUrl(result.link);
       if (!content) continue;
       
       const textContent = extractText(content);
       const info = extractInfo(result.title, result.source, result.date, textContent);
       allData.push(info);
       await new Promise(resolve => setTimeout(resolve, 2000)); // 避免请求过快
     }

     const markdown = generateMarkdownTable(allData);
     fs.writeFileSync(LATEST_FILE, markdown, 'utf-8');
     console.log(`已生成汇总文件：${LATEST_FILE}`);

     // 上传到Coze知识库（需配置API）
     await uploadToCoze(LATEST_FILE);
   }

   // 上传到Coze的函数（需在Coze中生成Token和Dataset ID）
   async function uploadToCoze(filePath) {
     const token = process.env.COZE_API_TOKEN;
     const datasetId = process.env.COZE_DATASET_ID;
     
     if (!token || !datasetId) {
       console.log('⚠️ 未检测到Coze配置，跳过上传');
       return;
     }

     try {
       const content = fs.readFileSync(filePath, 'utf-8');
       const base64Content = Buffer.from(content).toString('base64');
       
       const response = await axios.post(
         `https://api.coze.cn/v1/datasets/create_file`,
         {
           dataset_id: datasetId,
           documents: [{
             name: path.basename(filePath),
             source_info: {
               file_base64: base64Content,
               file_type: 'markdown'
             }
           }]
         },
         {
           headers: {
             'Authorization': `Bearer ${token}`,
             'Content-Type': 'application/json'
           }
         }
       );
       
       console.log('Coze上传成功:', response.data);
     } catch (error) {
       console.error('Coze上传失败:', error.response?.data || error.message);
     }
   }

   main().catch(e => {
     console.error('致命错误:', e);
     process.exit(1);
   });
   
