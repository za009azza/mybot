const { Client, GatewayIntentBits, AttachmentBuilder } = require('discord.js');
const Canvas = require('canvas');
require('dotenv').config();

// IDs
const WELCOME_CHANNEL_ID = '1470537154206765241';
const RULES_CHANNEL_ID = '1470536930557952070';

// إنشاء البوت
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});


// عند تشغيل البوت
client.once('ready', async () => {

    console.log(`✅ البوت اشتغل: ${client.user.tag}`);

    try {

        const guild = client.guilds.cache.first();
        if (!guild) return console.log("❌ لم يتم العثور على سيرفر");

        const channel = guild.channels.cache.get(WELCOME_CHANNEL_ID);
        if (!channel) return console.log("❌ لم يتم العثور على القناة");

        // رسالة اختبار عادية
        await channel.send("✅ هذا اختبار: البوت قادر يرسل رسائل!");

        // جلب الأعضاء الحقيقيين (حل مضمون)
        const members = await guild.members.fetch();

        // اختيار أول عضو ليس بوت
        const member = members.find(m => !m.user.bot);

        if (!member) {
            console.log("❌ لم يتم العثور على عضو للاختبار");
            return;
        }

        // إرسال صورة اختبار الترحيب
        await sendWelcomeCanvas(
            channel,
            member,
            "🔹 هذا اختبار الترحيب على"
        );

        console.log("✅ تم إرسال اختبار الترحيب بالصورة");

    } catch (error) {

        console.log("❌ خطأ في الاختبار:", error);

    }

});


// عند دخول عضو جديد
client.on('guildMemberAdd', async member => {

    try {

        const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);

        if (!channel) return;

        await sendWelcomeCanvas(
            channel,
            member,
            "أهلاً بك"
        );

        console.log(`✅ تم الترحيب بالعضو ${member.user.tag}`);

    } catch (error) {

        console.log("❌ خطأ في الترحيب:", error);

    }

});


// دالة إنشاء صورة الترحيب
async function sendWelcomeCanvas(channel, member, greetingText) {

    const canvas = Canvas.createCanvas(1280, 720);
    const ctx = canvas.getContext('2d');


    // تحميل الخلفية
    const background = await Canvas.loadImage(
        'https://i.imgur.com/70aKU1I.png'
    );

    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);


    // طبقة شفافة سوداء خفيفة لتحسين الوضوح
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    // إعدادات الدائرة
    const centerX = 640;
    const centerY = 360;
    const radius = 140;


    // تحميل الأفاتار
    const avatar = await Canvas.loadImage(
        member.user.displayAvatarURL({
            extension: 'png',
            size: 512
        })
    );


    // رسم الأفاتار داخل دائرة
    ctx.save();

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    ctx.drawImage(
        avatar,
        centerX - radius,
        centerY - radius,
        radius * 2,
        radius * 2
    );

    ctx.restore();


    // رسم إطار أزرق حول الأفاتار
    ctx.strokeStyle = "#00BFFF";
    ctx.lineWidth = 8;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();


    // كتابة النص الرئيسي
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";

    ctx.shadowColor = "rgba(0,0,0,0.7)";
    ctx.shadowBlur = 20;

    ctx.fillText(
        `${greetingText} ${member.user.username}`,
        canvas.width / 2,
        centerY + 200
    );


    // كتابة التاق
    ctx.font = "40px Arial";
    ctx.fillStyle = "#dddddd";
    ctx.shadowBlur = 10;

    ctx.fillText(
        member.user.tag,
        canvas.width / 2,
        centerY + 260
    );


    // إنشاء الصورة
    const attachment = new AttachmentBuilder(
        canvas.toBuffer(),
        { name: "welcome.png" }
    );


    // إرسال الرسالة
    await channel.send({

        content:
            `${greetingText} <@${member.id}> 👋\n` +
            `لا تنسى قراءة <#${RULES_CHANNEL_ID}>`,

        files: [attachment]

    });

}


// تسجيل الدخول
client.login(process.env.TOKEN);