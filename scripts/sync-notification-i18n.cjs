/**
 * Align home + settings notification copy with shipped daily local reminders (1.0.7).
 * Run: node scripts/sync-notification-i18n.cjs
 */
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'src/i18n/locales');

/** @type {Record<string, Record<string, string>>} */
const patches = {
  en: {
    'home.remindersCardSub': 'Daily reminder in Settings → Notifications',
    'settings.notifyOn': 'Daily reminders on',
    'settings.notifyOff': 'Daily reminders off',
    'settings.notifySub': 'One friendly nudge per day to open Planly and plan your day',
    'settings.notifyToggle': 'Daily reminder',
    'settings.notifyToggleSub':
      'Local notification around {{hour}}:00. Turn off anytime — no alerts when disabled.',
    'settings.notifyPermissionTitle': 'Notifications blocked',
    'settings.notifyPermissionBody':
      'Allow notifications in system settings to receive the daily reminder.',
    'settings.notifyExpoGoTitle': 'Install the app',
    'settings.notifyExpoGoBody':
      'Daily reminders work in the TestFlight or store build, not in Expo Go.',
    'reminder.dailyTitle': 'Plan your day',
    'reminder.dailyBody': 'Open Planly and add today’s tasks — small steps add up.',
  },
  tr: {
    'home.remindersCardSub': 'Ayarlar → Bildirimler’de günlük hatırlatıcı',
    'settings.notifyOn': 'Günlük hatırlatıcı açık',
    'settings.notifyOff': 'Günlük hatırlatıcı kapalı',
    'settings.notifySub': 'Günde bir kez Planly’yi açman için nazik bir hatırlatma',
    'settings.notifyToggle': 'Günlük hatırlatıcı',
    'settings.notifyToggleSub': 'Yaklaşık saat {{hour}}:00’da yerel bildirim. Kapatınca bildirim gelmez.',
    'settings.notifyPermissionTitle': 'Bildirim izni kapalı',
    'settings.notifyPermissionBody':
      'Günlük hatırlatıcı için telefon ayarlarından Planly bildirimlerine izin ver.',
    'settings.notifyExpoGoTitle': 'Uygulama gerekli',
    'settings.notifyExpoGoBody':
      'Günlük hatırlatıcı TestFlight veya mağaza sürümünde çalışır; Expo Go’da değil.',
    'reminder.dailyTitle': 'Gününü planla',
    'reminder.dailyBody': 'Planly’yi aç ve bugünün görevlerini ekle — küçük adımlar birikir.',
  },
  de: {
    'home.remindersCardSub': 'Tägliche Erinnerung unter Einstellungen → Benachrichtigungen',
    'settings.notifyOn': 'Tägliche Erinnerung an',
    'settings.notifyOff': 'Tägliche Erinnerung aus',
    'settings.notifySub': 'Ein freundlicher Hinweis pro Tag, Planly zu öffnen und deinen Tag zu planen',
    'settings.notifyToggle': 'Tägliche Erinnerung',
    'settings.notifyToggleSub':
      'Lokale Benachrichtigung gegen {{hour}}:00 Uhr. Jederzeit abschaltbar — keine Alerts, wenn aus.',
    'settings.notifyPermissionTitle': 'Benachrichtigungen blockiert',
    'settings.notifyPermissionBody':
      'Erlaube Benachrichtigungen in den Systemeinstellungen für die tägliche Erinnerung.',
    'settings.notifyExpoGoTitle': 'App installieren',
    'settings.notifyExpoGoBody':
      'Tägliche Erinnerungen funktionieren in TestFlight oder der Store-Version, nicht in Expo Go.',
    'reminder.dailyTitle': 'Plane deinen Tag',
    'reminder.dailyBody':
      'Öffne Planly und füge die heutigen Aufgaben hinzu — kleine Schritte summieren sich.',
  },
  fr: {
    'home.remindersCardSub': 'Rappel quotidien dans Réglages → Notifications',
    'settings.notifyOn': 'Rappel quotidien activé',
    'settings.notifyOff': 'Rappel quotidien désactivé',
    'settings.notifySub': 'Un petit rappel par jour pour ouvrir Planly et organiser ta journée',
    'settings.notifyToggle': 'Rappel quotidien',
    'settings.notifyToggleSub':
      'Notification locale vers {{hour}} h. Désactivable à tout moment — aucune alerte si c’est off.',
    'settings.notifyPermissionTitle': 'Notifications bloquées',
    'settings.notifyPermissionBody':
      'Autorise les notifications dans les réglages système pour recevoir le rappel quotidien.',
    'settings.notifyExpoGoTitle': 'Installer l’app',
    'settings.notifyExpoGoBody':
      'Les rappels quotidiens fonctionnent sur TestFlight ou la version store, pas dans Expo Go.',
    'reminder.dailyTitle': 'Organise ta journée',
    'reminder.dailyBody':
      'Ouvre Planly et ajoute les tâches du jour — les petits pas comptent.',
  },
  es: {
    'home.remindersCardSub': 'Recordatorio diario en Ajustes → Notificaciones',
    'settings.notifyOn': 'Recordatorio diario activado',
    'settings.notifyOff': 'Recordatorio diario desactivado',
    'settings.notifySub': 'Un aviso amable al día para abrir Planly y planificar tu día',
    'settings.notifyToggle': 'Recordatorio diario',
    'settings.notifyToggleSub':
      'Notificación local hacia las {{hour}}:00. Desactívalo cuando quieras — sin alertas si está off.',
    'settings.notifyPermissionTitle': 'Notificaciones bloqueadas',
    'settings.notifyPermissionBody':
      'Permite las notificaciones en ajustes del sistema para recibir el recordatorio diario.',
    'settings.notifyExpoGoTitle': 'Instala la app',
    'settings.notifyExpoGoBody':
      'Los recordatorios diarios funcionan en TestFlight o la versión de la tienda, no en Expo Go.',
    'reminder.dailyTitle': 'Planifica tu día',
    'reminder.dailyBody': 'Abre Planly y añade las tareas de hoy — los pequeños pasos suman.',
  },
  it: {
    'home.remindersCardSub': 'Promemoria giornaliero in Impostazioni → Notifiche',
    'settings.notifyOn': 'Promemoria giornaliero attivo',
    'settings.notifyOff': 'Promemoria giornaliero disattivo',
    'settings.notifySub': 'Un promemoria al giorno per aprire Planly e organizzare la giornata',
    'settings.notifyToggle': 'Promemoria giornaliero',
    'settings.notifyToggleSub':
      'Notifica locale verso le {{hour}}:00. Disattivalo quando vuoi — nessun avviso se è off.',
    'settings.notifyPermissionTitle': 'Notifiche bloccate',
    'settings.notifyPermissionBody':
      'Consenti le notifiche nelle impostazioni di sistema per il promemoria giornaliero.',
    'settings.notifyExpoGoTitle': 'Installa l’app',
    'settings.notifyExpoGoBody':
      'I promemoria giornalieri funzionano su TestFlight o la versione store, non in Expo Go.',
    'reminder.dailyTitle': 'Organizza la giornata',
    'reminder.dailyBody': 'Apri Planly e aggiungi le attività di oggi — i piccoli passi contano.',
  },
  pt: {
    'home.remindersCardSub': 'Lembrete diário em Definições → Notificações',
    'settings.notifyOn': 'Lembrete diário ligado',
    'settings.notifyOff': 'Lembrete diário desligado',
    'settings.notifySub': 'Um lembrete por dia para abrir o Planly e planear o teu dia',
    'settings.notifyToggle': 'Lembrete diário',
    'settings.notifyToggleSub':
      'Notificação local por volta das {{hour}}:00. Desliga quando quiseres — sem alertas se estiver off.',
    'settings.notifyPermissionTitle': 'Notificações bloqueadas',
    'settings.notifyPermissionBody':
      'Permite notificações nas definições do sistema para receber o lembrete diário.',
    'settings.notifyExpoGoTitle': 'Instalar a app',
    'settings.notifyExpoGoBody':
      'Lembretes diários funcionam no TestFlight ou na versão da loja, não no Expo Go.',
    'reminder.dailyTitle': 'Planeia o teu dia',
    'reminder.dailyBody': 'Abre o Planly e adiciona as tarefas de hoje — pequenos passos somam.',
  },
  ru: {
    'home.remindersCardSub': 'Ежедневное напоминание: Настройки → Уведомления',
    'settings.notifyOn': 'Ежедневное напоминание вкл.',
    'settings.notifyOff': 'Ежедневное напоминание выкл.',
    'settings.notifySub': 'Одно напоминание в день открыть Planly и спланировать день',
    'settings.notifyToggle': 'Ежедневное напоминание',
    'settings.notifyToggleSub':
      'Локальное уведомление около {{hour}}:00. Можно отключить — без оповещений, когда выкл.',
    'settings.notifyPermissionTitle': 'Уведомления заблокированы',
    'settings.notifyPermissionBody':
      'Разрешите уведомления в настройках системы для ежедневного напоминания.',
    'settings.notifyExpoGoTitle': 'Установите приложение',
    'settings.notifyExpoGoBody':
      'Ежедневные напоминания работают в TestFlight или версии из магазина, не в Expo Go.',
    'reminder.dailyTitle': 'Спланируйте день',
    'reminder.dailyBody': 'Откройте Planly и добавьте задачи на сегодня — маленькие шаги складываются.',
  },
  ar: {
    'home.remindersCardSub': 'تذكير يومي من الإعدادات → الإشعارات',
    'settings.notifyOn': 'التذكير اليومي مفعّل',
    'settings.notifyOff': 'التذكير اليومي متوقّف',
    'settings.notifySub': 'تنبيه لطيف مرة يومياً لفتح Planly وتخطيط يومك',
    'settings.notifyToggle': 'تذكير يومي',
    'settings.notifyToggleSub':
      'إشعار محلي حوالي {{hour}}:00. أوقفه متى شئت — لا تنبيهات عند الإيقاف.',
    'settings.notifyPermissionTitle': 'الإشعارات محظورة',
    'settings.notifyPermissionBody': 'اسمح بالإشعارات من إعدادات النظام لتلقي التذكير اليومي.',
    'settings.notifyExpoGoTitle': 'ثبّت التطبيق',
    'settings.notifyExpoGoBody': 'التذكير اليومي يعمل في TestFlight أو نسخة المتجر، وليس في Expo Go.',
    'reminder.dailyTitle': 'خطّط ليومك',
    'reminder.dailyBody': 'افتح Planly وأضف مهام اليوم — الخطوات الصغيرة تتراكم.',
  },
  hi: {
    'home.remindersCardSub': 'सेटिंग → सूचनाओं में दैनिक रिमाइंडर',
    'settings.notifyOn': 'दैनिक रिमाइंडर चालू',
    'settings.notifyOff': 'दैनिक रिमाइंडर बंद',
    'settings.notifySub': 'Planly खोलकर दिन की योजना के लिए दिन में एक कोमल रिमाइंडर',
    'settings.notifyToggle': 'दैनिक रिमाइंडर',
    'settings.notifyToggleSub':
      'लगभग {{hour}}:00 बजे स्थानीय सूचना। कभी भी बंद करें — बंद होने पर कोई अलर्ट नहीं।',
    'settings.notifyPermissionTitle': 'सूचनाएँ अवरुद्ध',
    'settings.notifyPermissionBody':
      'दैनिक रिमाइंडर के लिए सिस्टम सेटिंग में सूचनाओं की अनुमति दें।',
    'settings.notifyExpoGoTitle': 'ऐप इंस्टॉल करें',
    'settings.notifyExpoGoBody':
      'दैनिक रिमाइंडर TestFlight या स्टोर बिल्ड में काम करता है, Expo Go में नहीं।',
    'reminder.dailyTitle': 'अपना दिन प्लान करें',
    'reminder.dailyBody': 'Planly खोलें और आज के कार्य जोड़ें — छोटे कदम जुड़ते हैं।',
  },
  ja: {
    'home.remindersCardSub': '設定 → 通知で毎日リマインダー',
    'settings.notifyOn': '毎日リマインダー ON',
    'settings.notifyOff': '毎日リマインダー OFF',
    'settings.notifySub': '1日1回、Planlyを開いて一日を計画するやさしいリマインダー',
    'settings.notifyToggle': '毎日リマインダー',
    'settings.notifyToggleSub':
      'おおよそ {{hour}}:00 のローカル通知。いつでもオフ — オフ時は通知なし。',
    'settings.notifyPermissionTitle': '通知がブロックされています',
    'settings.notifyPermissionBody': '毎日のリマインダーを受け取るには、システム設定で通知を許可してください。',
    'settings.notifyExpoGoTitle': 'アプリをインストール',
    'settings.notifyExpoGoBody':
      '毎日のリマインダーは TestFlight またはストア版で動作します。Expo Go では利用できません。',
    'reminder.dailyTitle': '一日を計画しよう',
    'reminder.dailyBody': 'Planlyを開いて今日のタスクを追加 — 小さな一歩が積み重なります。',
  },
  ko: {
    'home.remindersCardSub': '설정 → 알림에서 매일 알림',
    'settings.notifyOn': '매일 알림 켜짐',
    'settings.notifyOff': '매일 알림 꺼짐',
    'settings.notifySub': '하루에 한 번 Planly를 열어 하루를 계획하도록 돕는 알림',
    'settings.notifyToggle': '매일 알림',
    'settings.notifyToggleSub':
      '약 {{hour}}:00 로컬 알림. 언제든 끄기 — 꺼두면 알림 없음.',
    'settings.notifyPermissionTitle': '알림이 차단됨',
    'settings.notifyPermissionBody': '매일 알림을 받으려면 시스템 설정에서 알림을 허용하세요.',
    'settings.notifyExpoGoTitle': '앱 설치',
    'settings.notifyExpoGoBody':
      '매일 알림은 TestFlight 또는 스토어 빌드에서 동작하며 Expo Go에서는 동작하지 않습니다.',
    'reminder.dailyTitle': '하루를 계획하세요',
    'reminder.dailyBody': 'Planly를 열고 오늘 할 일을 추가하세요 — 작은 걸음이 모입니다.',
  },
  zh: {
    'home.remindersCardSub': '在设置 → 通知中开启每日提醒',
    'settings.notifyOn': '每日提醒已开启',
    'settings.notifyOff': '每日提醒已关闭',
    'settings.notifySub': '每天一次友好提醒，打开 Planly 规划你的一天',
    'settings.notifyToggle': '每日提醒',
    'settings.notifyToggleSub': '约在 {{hour}}:00 的本地通知。可随时关闭 — 关闭后不会收到提醒。',
    'settings.notifyPermissionTitle': '通知已被阻止',
    'settings.notifyPermissionBody': '请在系统设置中允许通知以接收每日提醒。',
    'settings.notifyExpoGoTitle': '安装应用',
    'settings.notifyExpoGoBody': '每日提醒在 TestFlight 或商店版本中可用，Expo Go 中不可用。',
    'reminder.dailyTitle': '规划你的一天',
    'reminder.dailyBody': '打开 Planly 并添加今日任务 — 小步积累。',
  },
};

function setPath(obj, dotted, value) {
  const parts = dotted.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i += 1) {
    cur = cur[parts[i]];
    if (!cur) throw new Error(`missing path ${dotted}`);
  }
  cur[parts[parts.length - 1]] = value;
}

for (const [code, fields] of Object.entries(patches)) {
  const filePath = path.join(localesDir, `${code}.json`);
  const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  for (const [key, value] of Object.entries(fields)) {
    setPath(json, key, value);
  }
  fs.writeFileSync(filePath, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
  console.log('synced', code);
}
