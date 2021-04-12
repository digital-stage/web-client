import {StageMember, User, useStageSelector } from "@digitalstage/api-client-react";

const StageMemberView = (props: {
  id: string
}) => {
  const {id} = props;
  const stageMember = useStageSelector<StageMember>(state => state.stageMembers.byId[id]);
  const remoteUser = useStageSelector<User>(state => state.remoteUsers.byId[stageMember.userId]);

  return (
    <div className="wrapper">
      <div className="inner">
        <div className="banner">

        </div>

      </div>
      <style jsx>{`
        .wrapper {
          width: 50vw;
          padding-top: 100%;
        }
        .inner {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
        }
        .banner {
          
        }
        @media only screen and (min-width: 600px) {
          .wrapper {
            width: 25vw;
          }
        }
        `}</style>
    </div>
  )
}
export default StageMemberView;