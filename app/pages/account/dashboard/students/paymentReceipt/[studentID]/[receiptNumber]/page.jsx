import ReceiptPageContent from '@/components/dashboard/admin/ReceiptPageContent';

const Page = ({ params: { studentID, receiptNumber } }) => {
    return (
        <ReceiptPageContent 
            studentID={studentID} 
            receiptNumber={receiptNumber} 
        />
    );
};

export default Page;