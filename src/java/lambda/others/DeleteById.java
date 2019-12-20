package lambda.others;

import java.io.PrintWriter;
import java.io.StringWriter;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.PrimaryKey;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.dynamodbv2.document.spec.DeleteItemSpec;

import cognito.Authorizer;
import exceptions.BodyException;
import interfaces.Deletable;
import lambda.structures.ServerlessOutput;

public class DeleteById {
	
	private static AmazonDynamoDB dynamoDB;
	private static DynamoDB dynamo;
	
	static {
		dynamoDB = AmazonDynamoDBClientBuilder.standard()
		                .withRegion("us-east-1")
		                .build();
		dynamo = new DynamoDB(dynamoDB);
	}
	
	public ServerlessOutput output(Deletable input, String tableName, String tableKey, String... roles) {
		
		Authorizer auth = new Authorizer(input.getAuthorization());
		
        ServerlessOutput output = new ServerlessOutput();
        
        DeleteItemSpec spec = new DeleteItemSpec();

        try {
        	
        	auth.verifyRole(roles);
        	
            if(input.getId() == null)
            	throw new BodyException("id=null");
            else
            	spec = spec.withPrimaryKey(new PrimaryKey(tableKey, input.getId()));

        	Table table = dynamo.getTable(tableName);
            table.deleteItem(spec);
            
            output.setStatusCode(200);
            output.setBody("Item with id=" + input.getId() + " deleted");
            
        } catch (BodyException be) {
        	output.requestRejected(be.getErr());
        } catch (Exception e) {
            output.setStatusCode(500);
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            output.setBody(sw.toString());
        }
	    return output;
	}	
}
