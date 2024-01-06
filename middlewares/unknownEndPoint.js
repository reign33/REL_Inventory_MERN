export default function unknownEndpoint(_, res){
   return res.status(404).json({error: "unknown Endpoint"});
}