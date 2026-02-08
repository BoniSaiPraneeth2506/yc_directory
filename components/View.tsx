import Ping from "@/components/Ping";
import { client } from "@/sanityio/lib/client";
import { STARTUP_VIEWS_QUERY } from "@/sanityio/lib/queries";
import ViewClient from "@/components/ViewClient";

const View = async ({ id }: { id: string }) => {
  const { views: totalViews } = await client
    .withConfig({ useCdn: false })
    .fetch(STARTUP_VIEWS_QUERY, { id });

  return (
    <div className="view-container">
      <ViewClient id={id} />
      <div className="absolute -top-2 -right-2">
        <Ping />
      </div>

      <p className="view-text">
        <span className="font-black">Views: {totalViews}</span>
      </p>
    </div>
  );
};
export default View;