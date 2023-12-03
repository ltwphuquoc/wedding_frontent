import React, { useEffect, useState } from "react";
import Image from "next/image";
import StarsIcon from "@mui/icons-material/Stars";
import { Controller, useForm } from "react-hook-form";
import { Rating } from "@mui/material";

import CheckNotFound from "@/components/common/CheckNotFound";
import { ReceivedIcon } from "@/components/Icons";
import ButtonBtn from "@/components/common/Button";
import { formatDateReceivedBooking } from "@/utils/convertDate";
import { formatMoney } from "@/utils/formatMoney";
import ModalPopup from "@/components/common/ModalPopup";
import TextAreaField from "@/components/common/TextAreaField";
import { createFeedBack, getAllFeedbackByCombo } from "@/services/feedback";
import { useAppDispatch } from "@/stores/hook";
import { statusApiReducer } from "@/stores/reducers/statusAPI";
import { ERROR_MESSAGES } from "@/constants/errors";
import { LocalStorage } from "@/shared/config/localStorage";

const PendingPage = ({ data }) => {
  //useForm
  const {
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    control,
    getValues, reset
  } = useForm({
    // resolver: yupResolver(tableSchema),
    defaultValues: {
      rate: 5,
      comment: ""
    },
    mode: "all",
  });
  //useState
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [booking, setBooking] = useState<any>();
  const [rate, setRate] = useState(5);
  const [feedBack, setFeedBack] = useState<any>();
  const [listIdUser, setListIdUser] = useState<any>();

  //const
  const feedBackRate = {
    1: "Rất tệ",
    2: "Tệ",
    3: "Bình thường",
    4: "Tốt",
    5: "Rất tốt"
  };

  const dispatch = useAppDispatch();

  //function
  const handleCloseModal = () => {
    setIsOpenModal(false);
  };

  const handleFeedBack = (item: any) => {
    setBooking(item);
    setIsOpenModal(true);
  };

  const fetchAllFeedBackByComboMenuId = async (comboMenuId: number) => {
    try {
      const res = await getAllFeedbackByCombo(comboMenuId);
      setFeedBack(res);
      setListIdUser(res?.map((item) => item?.userId));
    } catch (error: any) {
      dispatch(statusApiReducer.actions.setMessageError(error.message));
    }
  };
  const onSubmit = async (data: any) => {
    const dataCreate = {
      ...data,
      comboMenuId: booking?.comboMenu?.id,
      userId: JSON.parse(LocalStorage.get("user") || "{}")?.id,
      rating: +rate
    };
    try {
      const res = await createFeedBack(dataCreate);
      dispatch(statusApiReducer.actions.setMessageSuccess(ERROR_MESSAGES.FEEDBACK_SUCCESS));
      setIsOpenModal(false);
      reset();
    } catch (error: any) {
      dispatch(statusApiReducer.actions.setMessageError(error.message));
    }
  };

  const handleChangeStar = (e, value) => {
    setRate(+value);
  };

  //useEffect
  useEffect(() => {
    if (!booking) return;
    fetchAllFeedBackByComboMenuId(booking?.comboMenu?.id);
  }, [booking]);

  return (
    <div className="flex flex-col gap-5">
      <CheckNotFound data={data}>
        {
          data?.map((item, index) => (
            <div key={index} className="flex flex-col gap-[3px] shadow-[1px_3px-5px_red]">
              <div className="rounded-b-[6px] p-4 bg-[--clr-white-75] w-full text-[13px] text-[--clr-gray-500]">
                <div className="flex justify-between pb-1 text-[16px] text-[--clr-blue-400]">
                  <span>Sky View - Restaurant</span>
                  <span
                    className="flex gap-2 justify-between items-center"> <ReceivedIcon/><span>Dịch vụ đã trãi nghiệm</span></span>
                </div>
                <hr/>
                <div className="pt-1 flex gap-3">
                  <span>
                    <Image
                      src={item?.comboMenu?.service?.image}
                      width={100} height={100} priority={true} alt="book pending"/>
                  </span>
                  <div className="flex flex-col w-full justify-around">
                    <span className="text-[16px] font-semibold">{item?.comboMenu?.comboName}</span>
                    <span
                      className="text-[14px] text-[--clr-gray-400]">{item?.comboMenu?.description}</span>
                    <div
                      className="flex justify-between items-end w-full text-[14px] font-[500] text-[--clr-red-400]">
                      <span>Tổng tiền : {formatMoney(item?.totalMoney)} VND</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 whitespace-nowrap">
                    <span>Ngày nhận : {formatDateReceivedBooking(item?.comeInAt, item?.comeOutAt)?.comeInAtDate}</span>
                    <span>Thời gian : {formatDateReceivedBooking(item?.comeInAt, item?.comeOutAt)?.hourComeInAt} -
                      {formatDateReceivedBooking(item?.comeInAt, item?.comeOutAt)?.hourComeOutAt}</span>
                  </div>
                </div>
              </div>

              <div
                className="rrounded-t-[6px] p-4 bg-[--clr-orange-50] text-[13px] text-[--clr-gray-500] flex flex-col justify-end gap-3 w-full items-end">
                <span
                  className="text-[14px] text-[--clr-red-400] font-[500]">Tiền cọc : {formatMoney(item?.depositMoney) || 0} VND</span>
                <div className="flex gap-3">
                  <ButtonBtn startIcon={<StarsIcon/>} width={150} bg="var(--clr-orange-350)"
                    onClick={() => handleFeedBack(item)}>Đánh giá</ButtonBtn>
                </div>
              </div>

            </div>
          ))
        }
      </CheckNotFound>
      <ModalPopup
        open={isOpenModal}
        title="Đánh giá"
        setOpen={setIsOpenModal}
        closeModal={handleCloseModal}
      >
        <div className="min-w-[500px] h-auto p-6 relative">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex gap-3 mb-2">
              <Image src={booking?.comboMenu?.service?.image} width={60} height={60} priority={true} alt="booking"/>
              <div className="flex flex-col gap-1">
                <span
                  className="text-[14px] font-semibold text-[--clr-gray-500]">{booking?.comboMenu?.comboName}</span>
                <span className="text-[13px] italic text-[--clr-gray-400]">{booking?.comboMenu?.description}</span>
              </div>
            </div>
            <hr/>
            <div className="mt-2">
              <div className="flex items-center gap-5">
                <Controller
                  control={control}
                  name="rate"
                  defaultValue={5}
                  render={({ field: { onChange, ...rest } }) => (
                    <Rating
                      sx={{
                        "&.MuiRating-root": {
                          fontSize: "40px !important"
                        }
                      }}
                      {...rest}
                      onChange={(e, value) => {
                        onChange(e, value);
                        handleChangeStar(e, value);
                      }}
                    />
                  )}
                />
                <span className="text-amber-500 italic">
                  {
                    feedBackRate[getValues("rate")]
                  }
                </span>
              </div>

              <TextAreaField
                error={!!errors.comment}
                name="comment"
                label=""
                placeholder="Nhập nội dung đánh giá ..."
                defaultValue=""
                control={control}
                className="w-full"
                rows={5}
              />
            </div>
            <ButtonBtn width={150} type="submit" bg="var(--clr-blue-400)">Gửi</ButtonBtn>
          </form>
        </div>
      </ModalPopup>
    </div>
  );
};

export default PendingPage;