import styles from "./Offers.module.css";
import Card from "../Card/Card";
import data from "../../data/data";

const Offers: React.FC = () => {
  return (
    <>
      <section className={styles.offers}>
        <h2 className={styles.title}>Our Latest Offers</h2>
        <div className={styles.offersCard}>
          {data.cards.map((card) => (
            <Card key={card.id} card={card} />
          ))}
        </div>
      </section>
    </>
  );
};

export default Offers;
