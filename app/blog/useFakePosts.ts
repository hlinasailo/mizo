export interface FakePost {
  id: number
  title: string
  slug: string
  category: string
  thumbnail: string | null
  author: string
  date: string
  excerpt: string
  content: string
}

export const fakePosts: FakePost[] = [
  {
    id: 1,
    title: 'The Spirit of Zirna in Modern Mizo Society',
    slug: 'spirit-of-zirna-modern-mizo-society',
    category: 'Zirna',
    thumbnail: null,
    author: 'lalnghak',
    date: '2026-03-01',
    excerpt: 'Exploring how the traditional Mizo value of Zirna continues to shape community life and character in the modern age.',
    content: `
      <h2>The Roots of Zirna</h2>
      <p>Zirna, the Mizo concept of diligence and hardworking spirit, has been the backbone of community growth for generations. From the earliest village clearing to the modern entrepreneurial scene, this value has never waned.</p>
      <p>In a world increasingly distracted by short-form content and instant gratification, the community elders remind us that true success is built brick by brick, through persistent effort and unwavering dedication.</p>
      <h2>Zirna in the Workplace</h2>
      <p>Young professionals from Mizoram working across India consistently attribute their work ethic to the values instilled by their upbringing. The emphasis on showing up, putting in the work, and doing it with grace permeates the professional culture.</p>
      <blockquote>Where hard work meets humility, that is where Zirna truly lives.</blockquote>
      <p>This fusion of effort and character is what makes the Mizo approach to work distinctive. It is not mere productivity but a holistic dedication to the task at hand and to the people it serves.</p>
      <h2>Keeping the Flame Alive</h2>
      <p>Schools and community organizations are actively integrating Zirna into their curricula, ensuring that younger generations understand not just what to do but why the spirit behind diligence matters more than the outcome alone.</p>
    `
  },
  {
    id: 2,
    title: 'Preserving Zirna Through Community Events',
    slug: 'preserving-zirna-through-community-events',
    category: 'Zirna',
    thumbnail: null,
    author: 'malsawmi',
    date: '2026-02-20',
    excerpt: 'How local events and competitions celebrate and reinforce the Mizo work ethic across all age groups.',
    content: `
      <h2>Community at the Core</h2>
      <p>From annual farm competitions to craft fairs, community events in Mizoram have long served as living exhibitions of Zirna. These gatherings are not merely recreational — they are celebrations of what consistent effort looks like in practice.</p>
      <p>Participants, young and old, are judged not only on their output but on their process. Judges often take into account how the work was approached, how resources were managed, and how setbacks were handled.</p>
      <h2>Youth Programs Leading the Way</h2>
      <p>The Young Mizo Association, along with several church-based youth groups, runs annual skill showcases. These events draw hundreds of participants who demonstrate expertise in traditional weaving, cooking, music, farming, and modern entrepreneurship.</p>
      <ul>
        <li>Annual Thiangdi Craft Fair — a showcase of bamboo and textile artistry</li>
        <li>Zirna Challenge — a community project competition judged on effort and impact</li>
        <li>Heritage Cooking Day — grandmothers and grandchildren cooking side by side</li>
      </ul>
      <p>These events do more than preserve tradition — they create intergenerational bonds that transmit values more effectively than any classroom could.</p>
    `
  },
  {
    id: 3,
    title: 'What Zirna Means to Our Generation',
    slug: 'what-zirna-means-to-our-generation',
    category: 'Zirna',
    thumbnail: null,
    author: 'vanlalruata',
    date: '2026-01-15',
    excerpt: 'A personal reflection on growing up with the ideal of Zirna and how it shapes choices in career, relationships, and daily life.',
    content: `
      <h2>Growing Up Zirna</h2>
      <p>My grandmother never spoke about Zirna as a concept. She simply lived it. She would rise before the sun and work until the evening, not out of compulsion but out of a deep sense of purpose and responsibility to the family.</p>
      <p>Growing up, I watched her and understood instinctively that worth was not inherited — it was built. This understanding has shaped every major decision in my adult life.</p>
      <h2>Navigating Modernity</h2>
      <p>In an era of side-hustles, productivity hacks, and hustle culture, the authentic spirit of Zirna stands apart. It is not about doing more for the sake of more. It is about doing what must be done, doing it fully, and resting with a clear conscience.</p>
      <p>I see peers who grind endlessly but without peace. Zirna is different — it is purposeful effort paired with contentment.</p>
      <blockquote>Zirna is not a race. It is a way of walking.</blockquote>
    `
  },
  {
    id: 4,
    title: 'How Gospel Music Transforms Hearts in Mizoram',
    slug: 'gospel-music-transforms-hearts-mizoram',
    category: 'Gospel',
    thumbnail: null,
    author: 'lianhmingthanga',
    date: '2026-03-05',
    excerpt: 'A deep dive into how gospel music has woven itself into the cultural and spiritual fabric of Mizo life.',
    content: `
      <h2>The Sound of Faith</h2>
      <p>No event in Mizoram is complete without music. And no music is more integral to Mizo life than gospel. It fills church halls, echoes through mountain valleys, and streams from phone speakers in the smallest villages.</p>
      <p>The Mizo gospel tradition blends indigenous musical sensibilities with the lyrical depth of Christian theology. The result is a genre that is uniquely its own — recognizable yet deeply rooted in something universal.</p>
      <h2>Pioneer Voices</h2>
      <p>Legends paved the way for modern gospel artists who now record professionally and tour nationally. Their music carries forward a tradition of using melody to convert not just ears but hearts.</p>
      <p>Young artists today are pushing the genre into new sonic territories — blending it with folk, cinematic orchestration, and even electronic production — while keeping the message and soul intact.</p>
      <h2>Community Through Song</h2>
      <p>Perhaps the greatest power of gospel music in Mizoram lies in its communal nature. When hundreds of voices join in a familiar hymn, individual voices dissolve into something larger. Grief finds expression. Joy finds wings.</p>
    `
  },
  {
    id: 5,
    title: 'Finding Faith in Modern Times',
    slug: 'finding-faith-in-modern-times',
    category: 'Gospel',
    thumbnail: null,
    author: 'zothanpuii',
    date: '2026-02-14',
    excerpt: 'A personal journey through doubt, questioning, and ultimately finding a deeper, more grounded faith in a skeptical age.',
    content: `
      <h2>When Doubt Arrives</h2>
      <p>Faith is rarely a straight line. For many of us raised in deeply Christian households, the transition to adulthood brings questions that were never addressed in Sunday school. These questions are not signs of weakness — they are signs of a mind coming alive.</p>
      <p>I wrestled with my faith through university, reading philosophy, science, and theology simultaneously, often losing sleep over seeming contradictions. Looking back, that wrestling was the most formative period of my spiritual life.</p>
      <h2>What I Found on the Other Side</h2>
      <p>I did not find easy answers. What I found instead was a faith that could hold uncertainty without collapsing — one built less on certainty and more on relationship, community, and lived experience.</p>
      <blockquote>A faith that has never doubted is a faith that has never truly thought.</blockquote>
      <p>This is not a call to abandon belief but to deepen it, to let it wrestle and emerge more honest, more compassionate, and more useful in the real world.</p>
    `
  },
  {
    id: 6,
    title: 'Sunday Service Memories',
    slug: 'sunday-service-memories',
    category: 'Gospel',
    thumbnail: null,
    author: 'lalrindika',
    date: '2026-01-20',
    excerpt: 'A nostalgic reflection on growing up attending Sunday church services and the community bonds formed across years of shared worship.',
    content: `
      <h2>Six O'Clock Bells</h2>
      <p>The bells started at six in the morning. Long before the rest of the town stirred, the church bell rang out across our neighborhood, its sound rolling down through the valley and up the surrounding hills. To this day, I cannot hear a church bell without being transported immediately to that childhood kitchen, the smell of rice cooking and my mother's humming.</p>
      <p>Sunday morning in a Mizo household meant preparation. Best clothes were laid out the night before. Hair was braided. Shoes were polished. The whole ritual was as much about honor as it was about practicality — you were going to meet your community in its best expression.</p>
      <h2>The Service Itself</h2>
      <p>The most memorable part was never the sermon, though the sermons were often excellent. It was the singing. Two hundred voices in a concrete building with minimal acoustics somehow produced a sound that felt enormous and intimate at the same time.</p>
      <blockquote>When the whole congregation knows the same song, there is no stranger in the room.</blockquote>
      <h2>What I Carry Forward</h2>
      <p>I am not the most consistent church-goer anymore. Life and distance have complicated my relationship with regular attendance. But the values formed in those Sunday mornings — community, presence, the discipline of showing up — those are with me every day.</p>
    `
  },
  {
    id: 7,
    title: 'Mizo Traditional Attire in the Modern World',
    slug: 'mizo-traditional-attire-modern-world',
    category: 'Beauty & Fashion',
    thumbnail: null,
    author: 'sangpuii',
    date: '2026-03-08',
    excerpt: 'How designers and everyday people are incorporating Puan and traditional motifs into contemporary fashion statements.',
    content: `
      <h2>The Puan Renaissance</h2>
      <p>The Puan — Mizoram's traditional woven cloth — is having a moment. Once reserved for festivals and ceremonies, it is now appearing on fashion runways, in corporate meetings, and on social media feeds followed by thousands.</p>
      <p>Young designers are reimagining the Puan not as a relic but as raw material for innovation. Structured blazers, flowy dresses, and even accessories carry the distinctive geometric patterns that have defined Mizo textile art for centuries.</p>
      <h2>Everyday Integration</h2>
      <p>The shift is not limited to high fashion. Everyday women in Aizawl are finding creative ways to wear Puan wraps with modern blouses, sneakers alongside traditional skirts, and statement jewelry that blends traditional silverwork with contemporary design.</p>
      <ul>
        <li>Puan-wrapped maxi skirts paired with solid-colored oversized tops</li>
        <li>Traditional motif printed on modern cut shirts</li>
        <li>Handwoven accessories — bags, headbands, and belts</li>
      </ul>
      <p>The message is clear: identity and modernity are not opposites. They can be worn together, and they look good doing it.</p>
    `
  },
  {
    id: 8,
    title: 'Skincare Routines for the Northeast Climate',
    slug: 'skincare-routines-northeast-climate',
    category: 'Beauty & Fashion',
    thumbnail: null,
    author: 'zorinpuii',
    date: '2026-02-28',
    excerpt: 'Navigating humidity, cold winters, and everything in between — a practical guide to caring for your skin in Mizoram.',
    content: `
      <h2>Understanding the Climate</h2>
      <p>Mizoram's climate is a study in extremes. Winters bring cold, dry air that strips moisture from the skin, while the monsoon season delivers relentless humidity that can trigger breakouts and oiliness. A skincare routine that works in January may be completely wrong for July.</p>
      <h2>The Seasonal Switch</h2>
      <p>The most important principle for Northeast skincare is adaptability. Rather than sticking rigidly to one routine, learn to listen to your skin and adjust:</p>
      <ul>
        <li>October to February: Heavy moisturizers, facial oils, and barrier-supporting products.</li>
        <li>March to May: Transition to lighter hydrating serums and gel moisturizers.</li>
        <li>June to September: Minimal, breathable formulas — a good sunscreen is non-negotiable.</li>
      </ul>
      <h2>Local Ingredients Worth Knowing</h2>
      <p>Many traditional Mizo remedies contain ingredients now recognized by modern dermatology. Turmeric as an anti-inflammatory, moringa for its antioxidant profile, and rice water for brightening have all found their way into both homemade and commercial skincare lines.</p>
    `
  },
  {
    id: 9,
    title: 'The Night the River Spoke',
    slug: 'the-night-the-river-spoke',
    category: 'Story',
    thumbnail: null,
    author: 'rualkhuma',
    date: '2026-03-02',
    excerpt: 'A short story about an old fisherman, a mysterious flood, and a night that changed an entire village forever.',
    content: `
      <h2>Part One: The Warning</h2>
      <p>Old Tluanga had fished the Tlawng for fifty years. He knew its moods the way he knew his own breath — the subtle darkening of the current before a storm, the way the fish dove deep when the air pressure changed. But that evening, the river was doing something he had never seen.</p>
      <p>The water was still. Not calm — still. As if it had been told to stop. The frogs were silent. The kingfishers had gone. Even the wind, which always came off the water at dusk, had died completely.</p>
      <h2>Part Two: The Sound</h2>
      <p>At exactly midnight, the village heard it. A low, resonant sound from the direction of the river — not a roar or a rush, but something older, like a word spoken in a language no living person had learned.</p>
      <blockquote>"She is warning us," he told his daughter. "Get the family up the hill. Now."</blockquote>
      <p>By morning, when rescuers arrived from the nearest town, the lower banks of the village had been swallowed entirely. Every family who had listened to Tluanga's instruction was safe. He never fully explained how he knew. He only said: "After fifty years, she finally spoke clearly."</p>
    `
  },
  {
    id: 10,
    title: 'A Journey Through the Hills',
    slug: 'a-journey-through-the-hills',
    category: 'Story',
    thumbnail: null,
    author: 'lalrinthanga',
    date: '2026-02-10',
    excerpt: 'A reflective travel prose piece about hiking through the mountains of Southern Mizoram and what was discovered along the way.',
    content: `
      <h2>Day One: Departure</h2>
      <p>We left Lunglei at four in the morning, when the town was still wrapped in fog and silence. Our group of five had planned this trek for months — three days through the southern ranges, ending at a remote village few outsiders had visited in years.</p>
      <p>The first light found us already high above the town, the valley below disappearing into cloud. I remember stopping to look back and feeling, with sudden clarity, that I was exactly where I was supposed to be.</p>
      <h2>Day Two: The Plateau</h2>
      <p>If Day One was about climbing, Day Two was about openness. The trail emerged onto a plateau of tall grass that went in every direction. We could see three ridgelines, rain falling off a distant peak, and a village so small it appeared as a cluster of dark dots against the green.</p>
      <p>We sat for lunch in complete silence, eating rice and vegetables wrapped in banana leaves. The plateau had a quality of absolute stillness — full of something wordless and old.</p>
      <h2>Day Three: Arriving</h2>
      <p>The village received us with fire and food. We ate together, sang together, and slept under a sky so thick with stars it seemed like excess.</p>
      <p>On the long road home, none of us spoke much. Some things are best processed in silence, at your own pace, over many months.</p>
    `
  },
  {
    id: 11,
    title: 'Youth Voices in Mizo Politics Today',
    slug: 'youth-voices-mizo-politics-today',
    category: 'Politics',
    thumbnail: null,
    author: 'thangvunga',
    date: '2026-03-07',
    excerpt: 'An analysis of how young Mizos are entering the political conversation — as voters, activists, and increasingly as candidates.',
    content: `
      <h2>A New Political Consciousness</h2>
      <p>The 2023 state assembly elections marked a turning point in youth political participation in Mizoram. Voter turnout among 18–25 year olds reached record levels, driven by organized voter registration campaigns run entirely by student groups without institutional backing.</p>
      <p>This surge reflected a generation that has grown up with instant access to information, comparative awareness of governance across India, and a decreasing patience for the same political families trading power across decades.</p>
      <h2>Beyond Voting</h2>
      <p>Young people are attending ward-level meetings in larger numbers, submitting RTI requests, running accountability blogs, and contesting local body elections in growing numbers.</p>
      <ul>
        <li>Over forty youth-led civil society groups registered in the last three years</li>
        <li>Average age of new municipal candidates dropping steadily since 2019</li>
        <li>Youth political forums drawing hundreds to community halls in Aizawl and Champhai</li>
      </ul>
      <p>The conversation is no longer about whether young people care about politics. The question now is what kind of politics they will build.</p>
    `
  },
  {
    id: 12,
    title: 'The Rise of Civil Society in Mizoram',
    slug: 'rise-of-civil-society-mizoram',
    category: 'Politics',
    thumbnail: null,
    author: 'lalbiakthanga',
    date: '2026-01-30',
    excerpt: 'A look at how non-governmental organizations, church bodies, and community groups have shaped governance in Mizoram over the decades.',
    content: `
      <h2>Civil Society as Governance</h2>
      <p>Mizoram presents a fascinating case study in how non-state actors can fill governance gaps. The Young Mizo Association and the Mizo Hmeichhe Insuihkhawm Pawl have for decades operated parallel social welfare and dispute resolution systems that command enormous public trust.</p>
      <p>These organizations emerged precisely because state institutions were often slow, distant, and unresponsive. They succeeded by being none of those things — quick, community-embedded, and accountable to local need.</p>
      <h2>Church Bodies and Political Influence</h2>
      <p>The role of church bodies in Mizo civic life cannot be overstated. Major denominations wield considerable influence through moral persuasion — issuing statements on elections, corruption, and social welfare that carry significant weight with the majority Christian population.</p>
      <blockquote>In Mizoram, the church is not separate from civil society. It is often its most organized expression.</blockquote>
      <p>The debate around this influence is ongoing and reflects a genuinely complex reality that resists easy categorization.</p>
    `
  },
  {
    id: 13,
    title: 'The Art of Bamboo Crafting',
    slug: 'art-of-bamboo-crafting',
    category: 'Thiamna',
    thumbnail: null,
    author: 'hrangchhuana',
    date: '2026-02-22',
    excerpt: 'Master craftsman Zohnuna shares the philosophy and practice of traditional bamboo artistry that has been in his family for four generations.',
    content: `
      <h2>Bamboo as Living Material</h2>
      <p>To the untrained eye, bamboo is just bamboo. To Zohnuna, it is a conversation. Each piece has its own grain, its own memory of how it grew, its own response to the knife. Learning to craft with bamboo is learning to listen.</p>
      <p>Zohnuna has been working with bamboo since he was eight years old, when his grandfather first handed him a small blade and a length of stem and told him simply: "Feel what it wants to become."</p>
      <h2>The Four Stages of Mastery</h2>
      <ul>
        <li>Knowing the material — understanding species, growth conditions, and harvesting time</li>
        <li>Controlling the tools — developing hand strength and precision to execute technique consistently</li>
        <li>Reading the piece — seeing the finished form in the raw material before making a single cut</li>
        <li>Disappearing into the work — when craft becomes meditation and artisan and material collaborate</li>
      </ul>
      <h2>Keeping the Craft Alive</h2>
      <p>Zohnuna runs free workshops on weekends for children in his village. He does not charge because, as he says, "This knowledge does not belong to me. I am only its temporary keeper."</p>
    `
  },
  {
    id: 14,
    title: 'Mizo Cuisine: Recipes from Our Grandmothers',
    slug: 'mizo-cuisine-recipes-grandmothers',
    category: 'Others',
    thumbnail: null,
    author: 'remruatpuii',
    date: '2026-03-03',
    excerpt: 'A warm tribute to the women who shaped Mizo culinary tradition, with recipes passed down through generations.',
    content: `
      <h2>The Kitchen as Archive</h2>
      <p>Before there were cookbooks, there were grandmothers. In Mizo culture, the kitchen was as much a place of education as any school. Recipes were not written — they were demonstrated, adjusted, and transmitted through smell, taste, and the specific angle of a stirring wrist.</p>
      <p>My grandmother Lalnunzi made Bai three times a week. I watched her make it hundreds of times and thought I had memorized every step. The first time I tried it without her, it tasted entirely different. Something essential was in her hands, not in any recipe.</p>
      <h2>Bai — The Soul of Mizo Cooking</h2>
      <p>Bai is a stew of pork, vegetables, and bamboo shoot fermented just enough to add a depth that no other ingredient can replicate. Every family has their version. Every grandmother swears hers is the correct one. They are all correct.</p>
      <ul>
        <li>Pork (bone-in for flavor) — 500g</li>
        <li>Fermented bamboo shoot — 2 cups</li>
        <li>Mustard leaves — 1 bunch</li>
        <li>Dried chili paste — to taste</li>
      </ul>
      <blockquote>Cook on low heat until the broth turns a deep amber. That color is the flavor. Never rush it.</blockquote>
    `
  }
]
