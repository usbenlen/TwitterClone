import { Link } from "react-router";

import { APP_NAME, APP_ROUTES } from "@/constants";

import { InformationPage } from "@/pages/information/InformationPage";

const linkClassName = "rounded-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export default function HelpPage() {
  return (
    <InformationPage
      title="Допомога"
      description={`Кілька підказок, щоб швидко освоїтися у ${APP_NAME} та знайти потрібні функції.`}
      gif={{ src: "/gifs/information/help.gif", width: 400, height: 400 }}
      sections={[
        {
          title: "Як почати та відновити доступ",
          content: (
            <>
              Створіть акаунт і підтвердьте електронну адресу, щоб долучитися до
              спілкування. Якщо ви забули пароль, на сторінці входу оберіть{" "}
              <Link to={APP_ROUTES.FORGOT_PASSWORD} className={linkClassName}>
                «Забули пароль?»
              </Link>{" "}
              та дотримуйтеся підказок для відновлення доступу.
            </>
          ),
        },
        {
          title: "Як публікувати та взаємодіяти",
          content:
            "Напишіть думку в полі створення допису та натисніть кнопку публікації. Відповідайте на публікації, ставте вподобання, поширюйте їх або додавайте до закладок, щоб повернутися пізніше.",
        },
        {
          title: "Як знаходити людей і налаштувати профіль",
          content:
            "Використовуйте пошук для людей і дописів та підписуйтеся на цікавих авторів. У налаштуваннях можна відредагувати профіль, змінити пароль і вибрати світлу, темну або системну тему.",
        },
        {
          title: "Як повідомити про порушення",
          content: (
            <>
              Відкрийте меню публікації, оберіть «Поскаржитися» та вкажіть причину.
              Докладніше про правила спільноти читайте на сторінці{" "}
              <Link to={APP_ROUTES.TERMS} className={linkClassName}>
                «Умови»
              </Link>
              .
            </>
          ),
        },
      ]}
    />
  );
}
