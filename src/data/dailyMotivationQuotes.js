/**
 * Locale-aware daily motivation pools. Each locale has six messages for
 * an empty list, work in progress, and a completed day.
 */
export const MOTIVATION_QUOTES_BY_LANGUAGE = {
  tr: {
    empty: ['Küçük bir adım, büyük bir günün başlangıcıdır.', 'Boş listen, bugünü bilinçle kurmak için bir fırsat.', 'İlk görevi yaz; günün ritmi orada başlar.', 'Tek bir net hedef bugün için yeter.', 'Mükemmel anı bekleme; ilk satırı şimdi ekle.', 'Sakin bir plan, dağınık bir günden iyidir.'],
    inProgress: ['Odaklan: sıradaki iş için şu an yeter.', 'Her tamamlanan görev, güvenini büyütür.', 'Çok iş varsa bile yalnızca bir sonrakine bak.', 'Küçük tikler, büyük bir ilerleme yaratır.', 'Acele etme; önceliğini koru.', 'İlerleme sessizdir, ama seni ileri taşır.'],
    allDone: ['Bugünü kapattın; bu da bir başarı.', 'Liste temizse dinlenmek için yer açılmıştır.', 'Tamamlanan işler yarının özgürlüğüdür.', 'İyi iş çıkardın; emeğini fark et.', 'Bugünü bitirmek yarını hafifletir.', 'Durakla ve enerjini yenile; bunu hak ettin.'],
  },
  en: {
    empty: ['A small step can shape a meaningful day.', 'An empty list is room to choose what matters.', 'Write the first task and give the day direction.', 'One clear goal is enough to begin.', 'Do not wait for the perfect moment; start now.', 'A calm plan makes space for focused work.'],
    inProgress: ['Focus on the next task; that is enough for now.', 'Every completed task builds momentum.', 'When the list feels long, choose just one next step.', 'Small checkmarks create real progress.', 'Keep your priorities clear and move at your pace.', 'Quiet progress still moves you forward.'],
    allDone: ['You closed out the day well.', 'A clear list makes room for real rest.', 'What you finished today lightens tomorrow.', 'Take a moment to recognize your effort.', 'Completion is progress worth celebrating.', 'Rest and recharge; you earned the space.'],
  },
  es: {
    empty: ['Un paso pequeño puede dar forma a un gran día.', 'Una lista vacía deja espacio para lo importante.', 'Escribe la primera tarea y da dirección al día.', 'Una meta clara basta para empezar.', 'No esperes el momento perfecto: empieza ahora.', 'Un plan sereno abre espacio para concentrarte.'],
    inProgress: ['Concéntrate en la siguiente tarea; por ahora es suficiente.', 'Cada tarea terminada crea impulso.', 'Si la lista parece larga, elige solo el siguiente paso.', 'Las pequeñas marcas de verificación crean progreso real.', 'Mantén claras tus prioridades y avanza a tu ritmo.', 'El progreso silencioso también te lleva adelante.'],
    allDone: ['Cerraste bien el día.', 'Una lista limpia deja espacio para descansar.', 'Lo que terminaste hoy aligera el mañana.', 'Tómate un momento para reconocer tu esfuerzo.', 'Completar es un progreso que merece celebrarse.', 'Descansa y recupera energía; te lo ganaste.'],
  },
  de: {
    empty: ['Ein kleiner Schritt kann einen guten Tag gestalten.', 'Eine leere Liste schafft Raum für das Wesentliche.', 'Schreib die erste Aufgabe auf und gib dem Tag Richtung.', 'Ein klares Ziel genügt, um zu beginnen.', 'Warte nicht auf den perfekten Moment; fang jetzt an.', 'Ein ruhiger Plan schafft Platz für Konzentration.'],
    inProgress: ['Konzentriere dich auf die nächste Aufgabe; das reicht jetzt.', 'Jede erledigte Aufgabe schafft Schwung.', 'Wirkt die Liste lang, wähle nur den nächsten Schritt.', 'Kleine Häkchen schaffen echten Fortschritt.', 'Behalte deine Prioritäten im Blick und geh in deinem Tempo.', 'Stiller Fortschritt bringt dich ebenfalls voran.'],
    allDone: ['Du hast den Tag gut abgeschlossen.', 'Eine leere Liste schafft Raum für echte Erholung.', 'Was du heute erledigt hast, erleichtert morgen.', 'Nimm dir einen Moment, deinen Einsatz anzuerkennen.', 'Abschluss ist Fortschritt, den du feiern darfst.', 'Ruh dich aus und tanke auf; du hast es verdient.'],
  },
  fr: {
    empty: ['Un petit pas peut donner du sens à la journée.', 'Une liste vide laisse de la place à l’essentiel.', 'Écris la première tâche et donne une direction à ta journée.', 'Un objectif clair suffit pour commencer.', 'N’attends pas le moment parfait : commence maintenant.', 'Un plan calme laisse de la place à la concentration.'],
    inProgress: ['Concentre-toi sur la prochaine tâche, cela suffit pour l’instant.', 'Chaque tâche terminée crée de l’élan.', 'Si la liste semble longue, choisis simplement l’étape suivante.', 'Les petites coches créent un vrai progrès.', 'Garde tes priorités claires et avance à ton rythme.', 'Les progrès discrets te font aussi avancer.'],
    allDone: ['Tu as bien terminé ta journée.', 'Une liste terminée laisse de la place au vrai repos.', 'Ce que tu as fini aujourd’hui allège demain.', 'Prends un instant pour reconnaître ton effort.', 'Terminer est un progrès qui mérite d’être célébré.', 'Repose-toi et recharge-toi : tu l’as mérité.'],
  },
  ar: {
    empty: ['خطوة صغيرة قد تصنع يوماً ذا معنى.', 'القائمة الفارغة مساحة لاختيار ما يهمك.', 'اكتب المهمة الأولى ومنح يومك اتجاهاً.', 'هدف واضح واحد يكفي للبدء.', 'لا تنتظر اللحظة المثالية؛ ابدأ الآن.', 'الخطة الهادئة تترك مساحة للتركيز.'],
    inProgress: ['ركّز على المهمة التالية؛ هذا يكفي الآن.', 'كل مهمة تنجزها تبني زخماً.', 'حين تبدو القائمة طويلة، اختر الخطوة التالية فقط.', 'علامات الإنجاز الصغيرة تصنع تقدماً حقيقياً.', 'حافظ على وضوح أولوياتك وتقدم بوتيرتك.', 'التقدم الهادئ يدفعك إلى الأمام أيضاً.'],
    allDone: ['أنهيت يومك بشكل جيد.', 'القائمة المكتملة تترك مساحة للراحة الحقيقية.', 'ما أنجزته اليوم يخفف عن الغد.', 'خذ لحظة لتقدير جهدك.', 'الإنجاز تقدم يستحق الاحتفال.', 'استرح واستعد طاقتك؛ لقد استحققت ذلك.'],
  },
  pt: {
    empty: ['Um pequeno passo pode transformar o seu dia.', 'Uma lista vazia abre espaço para o que importa.', 'Escreva a primeira tarefa e dê rumo ao dia.', 'Um objetivo claro basta para começar.', 'Não espere o momento perfeito; comece agora.', 'Um plano tranquilo cria espaço para o foco.'],
    inProgress: ['Concentre-se na próxima tarefa; por enquanto isso basta.', 'Cada tarefa concluída cria impulso.', 'Se a lista parecer longa, escolha apenas o próximo passo.', 'Pequenas marcações criam progresso real.', 'Mantenha as prioridades claras e avance no seu ritmo.', 'O progresso silencioso também leva você adiante.'],
    allDone: ['Você encerrou bem o dia.', 'Uma lista concluída abre espaço para descansar.', 'O que você terminou hoje torna amanhã mais leve.', 'Reserve um momento para reconhecer seu esforço.', 'Concluir é um progresso que merece celebração.', 'Descanse e recarregue as energias; você mereceu.'],
  },
  ru: {
    empty: ['Маленький шаг может сделать день значимым.', 'Пустой список — это место для самого важного.', 'Запишите первую задачу и задайте дню направление.', 'Одной ясной цели достаточно, чтобы начать.', 'Не ждите идеального момента — начните сейчас.', 'Спокойный план оставляет место для сосредоточенности.'],
    inProgress: ['Сосредоточьтесь на следующей задаче — пока этого достаточно.', 'Каждая выполненная задача создаёт импульс.', 'Если список кажется длинным, выберите только следующий шаг.', 'Небольшие отметки создают настоящий прогресс.', 'Держите приоритеты ясными и двигайтесь в своём темпе.', 'Тихий прогресс тоже ведёт вперёд.'],
    allDone: ['Вы хорошо завершили день.', 'Завершённый список оставляет место для отдыха.', 'То, что вы сделали сегодня, облегчает завтра.', 'Уделите минуту признанию своих усилий.', 'Завершение — это прогресс, достойный праздника.', 'Отдохните и восстановите силы — вы это заслужили.'],
  },
  zh: {
    empty: ['小小的一步，也能开启充实的一天。', '空白清单为真正重要的事留出了空间。', '写下第一项任务，让今天有了方向。', '一个明确的目标就足以开始。', '不要等待完美时机，现在就开始。', '平静的计划能为专注留出空间。'],
    inProgress: ['专注于下一项任务，现在这样就足够了。', '每完成一项任务，都会积累动力。', '清单很长时，只选择下一步。', '小小的勾选带来真实的进展。', '明确优先级，按自己的节奏前进。', '安静的进步同样会带你向前。'],
    allDone: ['你很好地完成了今天。', '清空的清单为真正的休息腾出了空间。', '今天完成的事，会让明天更轻松。', '花一点时间肯定自己的努力。', '完成本身就是值得庆祝的进步。', '好好休息，补充能量；这是你应得的。'],
  },
  ja: {
    empty: ['小さな一歩が、充実した一日をつくります。', '空のリストは、大切なことを選ぶ余白です。', '最初のタスクを書いて、今日に方向を与えましょう。', '明確な目標が一つあれば、始められます。', '完璧な瞬間を待たず、今始めましょう。', '穏やかな計画は、集中する余白をつくります。'],
    inProgress: ['次のタスクに集中すれば、今はそれで十分です。', '完了したタスク一つひとつが勢いになります。', 'リストが長く感じたら、次の一歩だけを選びましょう。', '小さなチェックが確かな前進を生みます。', '優先順位を明確にして、自分のペースで進みましょう。', '静かな進歩も、確実に前へ進めてくれます。'],
    allDone: ['今日を気持ちよく終えられました。', '完了したリストは、本当の休息のための余白になります。', '今日終えたことが、明日を軽くします。', '自分の努力を認める時間を取りましょう。', '完了は、祝う価値のある前進です。', '休んで力を蓄えましょう。あなたにふさわしい時間です。'],
  },
  ko: {
    empty: ['작은 한 걸음이 의미 있는 하루를 만듭니다.', '빈 목록은 중요한 일을 선택할 여유입니다.', '첫 번째 할 일을 적고 오늘의 방향을 정하세요.', '분명한 목표 하나면 시작하기에 충분합니다.', '완벽한 순간을 기다리지 말고 지금 시작하세요.', '차분한 계획은 집중할 여백을 만듭니다.'],
    inProgress: ['다음 할 일에 집중하세요. 지금은 그것으로 충분합니다.', '완료한 일 하나하나가 추진력이 됩니다.', '목록이 길게 느껴지면 다음 한 단계만 고르세요.', '작은 체크가 진짜 진전을 만듭니다.', '우선순위를 분명히 하고 자신의 속도로 나아가세요.', '조용한 진전도 당신을 앞으로 이끕니다.'],
    allDone: ['오늘을 잘 마무리했습니다.', '비워진 목록은 진짜 휴식을 위한 여유를 만듭니다.', '오늘 끝낸 일이 내일을 더 가볍게 합니다.', '잠시 자신의 노력을 인정해 보세요.', '완료는 축하할 만한 진전입니다.', '푹 쉬고 에너지를 채우세요. 충분히 그럴 자격이 있습니다.'],
  },
  hi: {
    empty: ['एक छोटा कदम आपके दिन को अर्थपूर्ण बना सकता है।', 'खाली सूची महत्वपूर्ण काम चुनने की जगह देती है।', 'पहला काम लिखिए और दिन को दिशा दीजिए।', 'शुरू करने के लिए एक स्पष्ट लक्ष्य काफी है।', 'सही पल का इंतज़ार न करें; अभी शुरू करें।', 'शांत योजना एकाग्रता के लिए जगह बनाती है।'],
    inProgress: ['अगले काम पर ध्यान दें; अभी के लिए इतना काफी है।', 'हर पूरा काम गति बनाता है।', 'सूची लंबी लगे तो केवल अगला कदम चुनें।', 'छोटे चेक-मार्क वास्तविक प्रगति बनाते हैं।', 'प्राथमिकताएँ स्पष्ट रखें और अपनी गति से बढ़ें।', 'शांत प्रगति भी आपको आगे ले जाती है।'],
    allDone: ['आपने दिन को अच्छी तरह पूरा किया।', 'पूरी हुई सूची सच्चे आराम के लिए जगह बनाती है।', 'आज किया गया काम कल को हल्का बनाता है।', 'अपने प्रयास को पहचानने के लिए एक पल लें।', 'पूरा करना ऐसी प्रगति है जिसका उत्सव होना चाहिए।', 'आराम करें और ऊर्जा लौटाएँ; आपने यह कमाया है।'],
  },
  it: {
    empty: ['Un piccolo passo può rendere significativa la giornata.', 'Una lista vuota lascia spazio a ciò che conta.', 'Scrivi il primo compito e dai una direzione alla giornata.', 'Un obiettivo chiaro basta per iniziare.', 'Non aspettare il momento perfetto: inizia ora.', 'Un piano sereno crea spazio per la concentrazione.'],
    inProgress: ['Concentrati sul prossimo compito: per ora basta questo.', 'Ogni attività completata crea slancio.', 'Se la lista sembra lunga, scegli solo il prossimo passo.', 'Piccole spunte creano un progresso reale.', 'Tieni chiare le priorità e procedi al tuo ritmo.', 'Anche il progresso silenzioso ti porta avanti.'],
    allDone: ['Hai concluso bene la giornata.', 'Una lista completata lascia spazio al vero riposo.', 'Ciò che hai finito oggi alleggerisce il domani.', 'Prenditi un momento per riconoscere il tuo impegno.', 'Concludere è un progresso che merita di essere celebrato.', 'Riposa e ricaricati: te lo sei meritato.'],
  },
};
