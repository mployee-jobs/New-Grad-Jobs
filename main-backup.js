import { Mongo } from "./dbConfig.js";

const db = new Mongo(process.env.MONGODB_URI, process.env.DB_NAME || "test");

const collections = ["jobs_it_mgmts_usa", "jobs_fin_legal_hrs_usa", "jobs_sales_mkt_ops_usa"]

const TO_INCLUDE = {
	company: 1,
	company_url: 1,
	locationNew: 1,
	location: 1,
	title: 1,
	country: 1,
	postedDateTime: 1,
	posted_date: 1,
	_id: 1,
	"Job ID (Numeric)": 1
};

const generateReadme = () => {
	try {
		console.log("🔄 Generating README.md...");

		// Calculate statistics
		let totalJobs = 0;
		let remoteJobs = 0;

		PROFILES_TO_INCLUDE.forEach((profile) => {
			const jobs = PROFILE_JOBS_MAPPING[profile] || [];
			totalJobs += jobs.length;
			jobs.forEach((job) => {
				if ((job.locationNew || job.location || "").toLowerCase().includes("remote")) {
					remoteJobs++;
				}
			});
		});

		// README Header
		let content = `
<div align="center">

# 🚀 Tech Jobs Board

### Your Gateway to Amazing Career Opportunities

![Total Listings](https://img.shields.io/badge/Total_Listings-${totalJobs}-blue?style=for-the-badge&logo=database)
![Last Updated](https://img.shields.io/badge/Updated-${new Date().toLocaleDateString()}-orange?style=for-the-badge&logo=clock)

---

## 🎯 Browse by Job Profile

<table>
<tr>
`;

		// Profile navigation cards - 4 in a row
		PROFILES_TO_INCLUDE.forEach((profile) => {
			const emoji = getProfileEmoji(profile);
			const anchor = profile.toLowerCase().replace(/\s+/g, "-");
			const jobCount = PROFILE_JOBS_MAPPING[profile]?.length || 0;

			content += `<td align="center" width="25%">
<a href="#-${anchor}">
<img src="https://img.shields.io/badge/${emoji}_${profile.replace(/ /g, '_')}-${jobCount}_Jobs-blue?style=for-the-badge" alt="${profile}">
</a>
<br>
<sub><b>${jobCount}</b> total positions</sub>
</td>
`;
		});

		content += `</tr>
</table>

</div>

---
`;

		// Generate sections for each profile
		PROFILES_TO_INCLUDE.forEach((profile) => {
			const jobs = PROFILE_JOBS_MAPPING[profile] || [];
			const emoji = getProfileEmoji(profile);
			const anchor = profile.toLowerCase().replace(/\s+/g, "-");

			content += `
## ${emoji} ${profile}
<a name="-${anchor}"></a>

> 💼 **${jobs.length}** positions available

<table>
<thead>
<tr>
<th width="20%">🏢 Company</th>
<th width="35%">💼 Role</th>
<th width="20%">📍 Location</th>
<th width="10%">⏰ Posted</th>
<th width="15%">🔗 Action</th>
</tr>
</thead>
<tbody>
`;

			if (jobs.length === 0) {
				content += `<tr><td colspan="5" align="center"><i>No positions available at the moment. Check back soon! 🔄</i></td></tr>\n`;
			} else {
				jobs.slice(0, 100).forEach((job) => {
					const company = job.company_url
						? `<a href="${job.company_url}">${job.company || "-"}</a>`
						: job.company || "-";

					const role = job.title || "-";
					const location = getLocationBadge(job.locationNew || job.location);
					const posted = getTimeAgo(job.posted_date || job.postedDateTime);

					// Generate dynamic URL for your website
					const jobUrl = generateJobUrl(job, profile);
					const apply = `<a target="_blank" rel="noopener noreferrer" href="${jobUrl}"><img src="https://img.shields.io/badge/View-Job-blue?style=flat-square&logo=briefcase" alt="View Job"></a>`;

					content += `<tr>
<td>${company}</td>
<td>${role}</td>
<td>${location}</td>
<td>${posted}</td>
<td align="center">${apply}</td>
</tr>\n`;
				});

				if (jobs.length > 100) {
					content += `<tr><td colspan="5" align="center"><i>... and ${jobs.length - 100} more positions</i></td></tr>\n`;
				}
			}

			content += `</tbody>
</table>

---
`;
		});

		// Statistics Section
		content += `
## 📈 Statistics

<div align="center">

| Metric | Count |
|:-------|------:|
| 📊 Total Listings | **${totalJobs}** |
| 🌍 Remote Jobs | **${remoteJobs}** |
`;

		PROFILES_TO_INCLUDE.forEach((profile) => {
			content += `| ${getProfileEmoji(profile)} ${profile} | **${PROFILE_JOBS_MAPPING[profile]?.length || 0}** |\n`;
		});

		content += `
</div>

---

## 🎯 How to Apply?

<div align="center">

\`\`\`mermaid
graph LR
    A[📋 Browse Jobs] --> B[🔍 Find Your Match]
    B --> C[💼 Click View Job]
    C --> D[📝 Submit Application]
    D --> E[🎉 Get Hired!]
    
    style A fill:#e1f5ff
    style B fill:#fff3cd
    style C fill:#d4edda
    style D fill:#cfe2ff
    style E fill:#f8d7da
\`\`\`

</div>

### Steps to Apply:
1. 🔍 **Browse** through the positions above
2. 💼 **Click** the "View Job" button on your preferred role
3. 📝 **Complete** the application on our website
4. ✉️ **Wait** for us to review your application
5. 🎉 **Celebrate** when you get the interview call!

---

## 🔔 Stay Updated

<div align="center">

### ⭐ Star this repository to receive updates on new job postings!

**This job board is automatically updated every 6 hours**

</div>

---

## 💬 Contributing

Found a broken link or want to add a job posting? Feel free to:
- 🐛 Open an issue
- 🔧 Submit a pull request
- 📧 Contact us directly

---

## 🙏 Stay Connected

<div align="center">

[![Website](https://img.shields.io/badge/Website-Visit-FF6B6B?style=for-the-badge&logo=google-chrome&logoColor=white)](${process.env.WEBSITE_URL || 'https://yourwebsite.com'})
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Follow-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/company/yourcompany)
[![Twitter](https://img.shields.io/badge/Twitter-Follow-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/yourcompany)
[![Discord](https://img.shields.io/badge/Discord-Join-7289DA?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/yourserver)

---

### 📅 Last Updated

**${new Date().toLocaleString("en-US", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			timeZoneName: "short",
		})}**

---

<sub>💼 Jobs aggregated from multiple sources • ⚡ Auto-updated every 6 hours • 🤖 Powered by GitHub Actions</sub>

**Made with ❤️ for the Tech Community**

⬆️ [Back to Top](#-tech-jobs-board) ⬆️

</div>
`;

		// Write to file
		fs.writeFileSync("README.md", content);
		console.log("✅ README.md generated successfully!");
		console.log(`📊 Statistics:`);
		console.log(`   - Total jobs: ${totalJobs}`);
		console.log(`   - Remote jobs: ${remoteJobs}`);
	} catch (err) {
		console.error("[ERROR] Generating README:", err);
		throw err;
	}
};

const findJobs = async (collection) => {
	try {
		const regex = /new grad(s|uation|uate)?/i;
		const query = {
			title: { $regex: regex }
		}

		const jobs = await collection.find(query, {
			projection: TO_INCLUDE
		}).toArray();
		return jobs

	} catch (err) {
		console.log("[ERROR] in findJobs function ", err)
	}
}

const main = async () => {
	try {

		const jobs = (await Promise.all(
			collections.map(async (name) => {
				const collection = await db.getCollection(name);
				return findJobs(collection);
			})
		)).flat();

		console.log(jobs)
		console.log("total jobs : ", jobs.length)

	} catch (err) {
		console.log("[ERROR] in main driver function ", err)
	} finally {
		await db.close()
	}
}

main()