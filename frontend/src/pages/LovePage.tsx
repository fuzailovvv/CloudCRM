import { ChangeEvent, useState } from 'react';
import { Heart, LogOut, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clearLoveAccess } from '../auth/loveAuth';

const MEMORY_IMAGE_CANDIDATES = [
  ['/love/photo_2026-07-05_15-01-21.jpg'],
  ['/love/photo_2026-07-05_15-01-41.jpg'],
];

const USER_LONG_TEXT = `Lekin orada Zebinisoni uchratdim, boshida kibrli deb o'ylagan insonim boshqacha bo'lib chiqdi. Aprel oyida u bilan ham yozishishni boshladim, avval o'zim mock bo'yicha gaplashdim, keyin sekin-sekin tanishib, yaqin bo'lishni boshladik. Xuddi uning xarakteri Shoxsanamga o'xshar edi, ayniqsa ko'p gapirishi )) o'zim gapirishimni kutib qolardim, qarasam xuddi shunga o'xshaydi  ayniqsa mehribonchiligi, ertalab salom berishi, keyin video-chatda gaplashishimiz ham. U ham ko'p bolalarni mensimasdan qolardi, ayniqsa Azimjonni. Lekin "hech kimni yaxshi ko'rmiman" deb o'zimga va'da berib, o'z va'damni buzdim. Uning xarakteri o'xshagani uchun rostan sevdim, xuddi Shoxsanamni sevgan dan ham kopproq yaxshi kordim, lekin "men va'dam" deb o'ylab qolardim. To'g'ri, Zebiniso ko'rinishidan Shoxsanamga o'xshamasdi, lekin nima bo'lganda ham uni sevdim.
Keyin orada u gaplashgan bola keldi, mehrim ozgina tushdi, lekin o'yladim: "O'xshatmasdan uchratmas" deb aytdim o'zimga. Keyin 90 foizga yaqin yaxshi ko'rish bo'lib qoldi. 29-may kuni adami moshinalarini urib oldim, uydagilar bilan gap-so'z bo'ldi, juda og'ir gaplar eshitdim, hech kim men tarafda bo'lmadi. Ham ozimni biznisim yopildi arendator bilan muamo boldi shartnomam ham tugagandi. har tarafdan. Pul keladigan joylarim toxtadi. Ketidan Batutu biznesim ochidim. Pulim qomadi umumam 0 bolib qoldim, "universitet sessiyasini yopaman" deb, universitetning yotoqxonasida qoldim, lekin ovqatga pulim yetmasdi. U menga har kuni ovqat qilib jo'natardi, xuddi Shoxsanam meni kasalxonada yotganimda kelib qarashiga o'xshardi. "Rostan sevdim" dedim, va'damgayam qo'ydim, "shu qizi meniki bo'lsin" dedim, "birinchi sevgimga erisha olmadim" dedim, lekin o'yladim: "Men bilan teng erga teyib ketib qomasmikin " deb. "25 yoshda uylanish niyatim bor" deb, "nima bo'lsayam, taqdirim uchun harakat qilaman" dedim. Xuddi Shoxsanamga o'xshagani uchrasin deb ko'p so'rardim  "men uchradi" didim. U menda yo'qolgan qizlarni hurmat qilish, romantikani uyg'otdi.
Keyin to'satdan onasi, akasi telefon qilishni boshladi. Men dovdirab qoldim: "Nima deyishim kerak  'qizingizni yaxshi ko'raman' deyaymi?" deb akasi bilan ko'rishdim. Mashina urib olganimdan keyin ruhim tushdi, ishtiyoqim yo'qoldi. Keyin qo'rqib qoldim: hozir onamga, adam "bitta qizni yaxshi ko'raman, sovchilikka boring" disam, adam "o'g'lim, yaqinda qilgan ishing yetadi"didi dib oyladim, ustiga-ustak o'zimning tayinli ishim ham yo'q edi. O'yladim: avval Zebinisoning o'zidan nima bo'lganini bilib olsam, keyin hammasini gaplashib ko'raman, deb  lekin hammasi to'satdan bo'ldi, ham qo'rqdim, ham dovdiradim.
Mana shular sen bilishing kerak bo'lganlari. Men sendan yashiradigan sirim qolmadi. Bilaman, hozir sen mendan nafratlanasan. ko'rgani kelmayapti , men yana ayb ish qildim, hayotimga kelgan ikkinchi go'zal qizni ham yo'qotdim. Buning uchun kechira olsang, kechir, lekin bu hammasi haqiqat.
Boshqa uylanmagunimcha, sendan boshqasini yaxshi kormiman.
Bu safargi va'da: men boshqa senga o'xshagani chiqsa ham, va'da beraman  gaplashmiyman Zebiniso.
Agar imkoning bo'lsa, yoz, nima bo'lganini, tushuntir. Agar o'zing yozishni xohlamasang, meni blokdan ochsang, tushunaman va ozim yozaman instadami yoki tg danmi.  faqat tushuntir. Agar yo'q, "hech narsa qimiman" desan — kechir, dovdirab o'z baxtimni yo'qotdim. Nima bo'lgandayam men seni sevaman va yaxshi ko'raman, o'zingni ehtiyot qilgin. Iy, "aken menga qo'lini kesdi" dedila — shu to'g'rimi? Agar to'g'ri bo'lsa, unaqa qima, men uning uchun arzirman deb o'ylamiman, ayniqsa oxirgi qilgan ishimdan keyin.
To'liq o'qib chiqqan bo'lsang, rahmat.`

const PHOTO_STORAGE_KEYS = ['love_photo_1', 'love_photo_2'];

const MEMORY_PARAGRAPHS = [
  `Esingdami, bir yaqinim bo'lib qolsa, bir narsa etaman, deganidim. Bu haqida hech kim bilmasdi, ya'ni bu saytim haqida — men buni yaratishimdagi maqsad hamma narsani o'zim uchun eslab qolish bo'lgan.
2020-yil 10-aprel o'rtalarida do'stlarim bilan garov o'ynadim, u garov bir qizni orash edi. Bordim, 6-sinf qizga salom berib tanishdim va u men bilan ozgina aylanib gaplashishini so'radi, maktabning orqasidagi maydonda. Keyin o'sha paytda u voleybol o'ynashga qiziqishini etdi, men ham o'ynashni xohladim. O'zi, o'sha vaqtdagi maqsadim garovda yutib ortolarimdan 10 ming so'm olish edi )) bilaman, kulgili va achinarli, lekin men shuni qildim. U qizni oradim  7 kuncha o'tib, 17-kuni to'liq yutdim yani u qiz sevib qoldi. Ertasi kuni ortolarimdan o'sha pulni — 10 ming so'mni — oldim va ovqatlandik, kompyuter xonaga tushdik. U bilan gaplashish davom etdi. 6-sinf boladagi qizni yaxshi ko'rib qolish degan narsa yo'q edi, lekin orada ozgina o'tmasdan men uning kulishiga, ko'zlariga, xarakteriga oshiq bo'ldim. U shunchalik ko'p gapirardi, men faqat eshitardim. Ba'zida mening gapirishim qachon kelar ekan, deb kutardim )) lekin bu yoqimli edi. Keyin hayotimda birinchi sevgim paydo bo'ldi. U boshqa bolalarga qo'pol, mensimasdan muomala qilardi, ham u mening sinfdoshim edi )) o'shа garov sababi — u qiz qo'pol edi, bolalarni mensimasdi, sinfda kimdir gapirsa ham faqat baqirib gapirardi, harakati juda qo'polbogani uchun orash qiyin edi. Uning otasi har kuni kelib olib ketardi, otasi 787 Prado moshina haydardi, boy edi, va boy qizi bo'lganiga ham kibri bor edi, kichkina bo'lishiga qaramasdan.
Bilmadim, u meni nimamga uchdi — yaxshi ko'rib qoldi. Oradan oz vaqt o'tib men ham uni sevib qoldim. 6-sinf bola 6-sinf qizni o'zi xohlagandek qilib tarbiyalashni boshladi — kibrini yo'qotdim, hamma bilan muloyim gaplashadigan qildim, sal tor va kalta kiyishini boshladi 8-sinfda uzun kiyishini o'rgatdim. Xullas, qaysi xarakteri o'zimga yoqmasa, hammasini tuzatdim. 7-sinfdan boshlab bitta partada faqat birga o'tirdik. Keyin u 7-sinfda ingliz tiliga borishni boshladi, International School'ga. Manam u bilan bordim, lekin o'qish uchun emas, faqat u bilan birga bo'lish uchun. U elementary darajasidan o'tib ketdi, men o'tolmadim, va men uni boshqa o'qishga o'tishga ko'ndirdim — Us School'ga, yana birga o'qidik. Keyin kunlik vaqtimizning 50 foizini faqat birga o'tirardik. Keyin 9-sinfda adam ishdan boshadila, akamning o'zi ochgan korxonasi yopilib ketdi, ular ish topolmay qolishdi, faqat og'ir (qora) ishlar bor edi, shunga men ishlashim kerak bo'lib qoldi. Men jo'xori sotishda ishladim, oyiga 2 mln 800 ming so'm olardim, uyga ro'zg'or qilardim, adamga, onamga berardim. U esa mening ishdan kelishimni kutib uxlamasdi. Keyin video-qo'ng'iroqda meni ko'rib uxlamasa, ertasi kuni maktabda men bilan birga o'tirmasdi.Oradan 1 yil o'tdi, akam yana o'zini korxonasini ochdi, otam ishda lavozimi oshib bosh shifokor bo'lib ishga kirdi. Uydagilar "meni ishlama, o'qi" deyishdi. Keyin men ishdan bo'shadim va yana u bilan kunning yarmini birga o'tirdim  bunda ham o'qishdan maqsadim faqat u edi. 10-sinfda, dekabr oyida sinflar orasida iskal bo'ldi, men bitta bolani urdim, keyin militsiyaga tushdim, lekin hech narsa bo'lmagandek rovididan akam olib chiqib ketdi. Dekabrning oxirida o'sha bolalar Durujbada ikkitasi meni tutib oldi va meni kaskаt bilan urib yiqitib ketishdi — o'rtog'im sigaret olgani ketgandi,man ozim sigaret kelishini kutib otirgandim. Keyin men kasalxonaga tushdim va u har kuni maktabdan kelib oldimga keladi, sok olib kelib ichirib qo'yardi. Menga turish mumkun emas edi, faqat yelkamdan oyog'imgacha oq pirastina bilan o'rab qo'yishgandi. U kelib yonimda uxlab qolardi, keyin men turg'izardim: "Tur, bor, uyingga bor" dib. U shunday dirdi: "Hammasi yaxshi bo'ladi, yaxshi bo'lib ketasan" deb. Bir oyda oyoqqa turdim, uydagilarga boshqa urishmasligimga va'da berdim. Keyin u bilan aylanishga bordim, u mengashunaqa didi: "Qara, sen akalaringga ishonib kalyanxonama-kalyanxona yurding, kuchingga ishonding, qo'lingdan hech narsa kelmadi. O'qi desam o'qimading, kimlaringgadir ishonib yurding — 'akalarim' dedim, hech narsa qilib bermadi senga." didi. Shundan keyin men o'qishni boshladim, hayotim izniga tushdi, o'z maqsadimni, yo'limni chizdim, kelajakda kim bo'lib chiqishimni belgilab harakat qildim. U ni ismi Shoxsanam edi.
  11-sinfda u xususiy kollejga o'tdi, men u bilan ko'rishishim kamaydi. Uning muomalasi ham ancha o'zgardi, har kuni arzimagan narsalani dib urishardik. 11-sinfni bitirganimdan keyin u ham kollejni bitirdi va iyun oyida o'qishga kirdi. Bizda yana oilaviy holat yomonlashdi. U "Men o'qib, grant bilan chet el universitetlariga kirdim, siz kirolmaysiz, men IELTS'dan 6 oldim, siz ololmayapsiz" — dedi. Bu gap qatiq tegdi.Orada u juda kop pul haqida tema ochib boy bolla haqida kop ogiz ochishi boshladi. Keyin unga o'zi ajralish uchun bahona kerak bo'lib yurganini sezdim, keyin ajraldik. Shundan keyin, ozimga uylanmagunimcha, qizlarni hurmat qimiman, romantika ham, "sevmimanam" ham didim o'zimga.`
];

export default function LovePage() {
  const navigate = useNavigate();
  const [candidateIndex, setCandidateIndex] = useState([0, 0]);
  const [missingPublicPhotos, setMissingPublicPhotos] = useState([false, false]);
  const [storedPhotos, setStoredPhotos] = useState<(string | null)[]>(() =>
    PHOTO_STORAGE_KEYS.map((key) => localStorage.getItem(key))
  );

  const handleLogout = () => {
    clearLoveAccess();
    navigate('/');
  };

  const handleImageError = (index: number) => {
    if (storedPhotos[index]) {
      localStorage.removeItem(PHOTO_STORAGE_KEYS[index]);
      setStoredPhotos((current) => {
        const next = [...current];
        next[index] = null;
        return next;
      });
      return;
    }

    if (candidateIndex[index] < MEMORY_IMAGE_CANDIDATES[index].length - 1) {
      setCandidateIndex((current) => {
        const next = [...current];
        next[index] += 1;
        return next;
      });
      return;
    }

    setMissingPublicPhotos((current) => {
      const next = [...current];
      next[index] = true;
      return next;
    });
  };

  const handlePhotoUpload = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const photo = typeof reader.result === 'string' ? reader.result : null;
      if (!photo) return;

      localStorage.setItem(PHOTO_STORAGE_KEYS[index], photo);
      setStoredPhotos((current) => {
        const next = [...current];
        next[index] = photo;
        return next;
      });
    };
    reader.readAsDataURL(file);
  };

  const getPhotoSource = (index: number) => {
    if (storedPhotos[index]) return storedPhotos[index];
    if (missingPublicPhotos[index]) return null;
    return MEMORY_IMAGE_CANDIDATES[index][candidateIndex[index]];
  };

  return (
    <main className="love-screen love-page">
      <div className="hearts" aria-hidden>
        <span className="heart" style={{ left: '8%', top: '86%', ['--x' as any]: '32px', animationDelay: '0s' }} />
        <span className="heart heart-soft" style={{ left: '22%', top: '82%', ['--x' as any]: '70px', animationDelay: '0.35s' }} />
        <span className="heart" style={{ left: '41%', top: '88%', ['--x' as any]: '46px', animationDelay: '0.9s' }} />
        <span className="heart heart-soft" style={{ left: '63%', top: '84%', ['--x' as any]: '88px', animationDelay: '1.25s' }} />
        <span className="heart" style={{ left: '82%', top: '87%', ['--x' as any]: '54px', animationDelay: '1.7s' }} />
      </div>

      <article className="love-story-shell" aria-label="Love page">
        <header className="love-story-header">
          <div className="love-icon-row" aria-hidden>
            <Sparkles size={22} />
            <Heart size={46} />
            <Sparkles size={22} />
          </div>
          <p className="love-kicker">2020-yil 10-aprel</p>
          <p>Bu sahifa men eslab qolishni xohlagan narsalar uchun.</p>
        </header>

        <section className="memory-gallery-row" aria-label="Ikki rasm">
          {[0, 1].map((index) => {
            const photoSource = getPhotoSource(index);

            if (photoSource) {
              return (
                <figure className="memory-photo-card side-by-side" key={index}>
                  <img src={photoSource} alt={`Xotira rasmi ${index + 1}`} onError={() => handleImageError(index)} />
                </figure>
              );
            }

            return (
              <label className="memory-photo-upload side-by-side" key={index}>
                <Heart size={28} />
                <span>{index + 1}-rasmni tanlash</span>
                <input type="file" accept="image/*" onChange={(event) => handlePhotoUpload(index, event)} />
              </label>
            );
          })}
        </section>

        <section className="memory-text memory-story" aria-label="Esingdami xotira">
          {MEMORY_PARAGRAPHS.map((paragraph, idx) => (
            <p key={idx} className="memory-story-paragraph">
              {paragraph}
            </p>
          ))}
        </section>

        <div className="main-love-wrap" aria-hidden>
          <img src="/love/love.jpg" alt="Love" className="main-love-image" />
        </div>

        <section className="memory-text memory-letter bottom-text" aria-label="Xotira matni">
          {USER_LONG_TEXT.split('\n\n').map((paragraph, idx) => (
            <p key={idx} className="memory-letter-paragraph">
              {paragraph}
            </p>
          ))}
        </section>

        <button type="button" className="ghost-button story-back-button" onClick={handleLogout}>
          <LogOut size={17} />
          Back to login
        </button>
      </article>
    </main>
  );
}
